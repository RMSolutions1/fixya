import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { validateProductionEnv } from './config/validate-env';

async function bootstrap() {
  validateProductionEnv();
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  const port = config.get<number>('app.port', 4000);
  const apiPrefix = config.get<string>('app.apiPrefix', 'v1');
  const corsOrigins = config.get<string[]>('app.corsOrigins', [
    'http://localhost:3000',
  ]);
  const enableSwagger = config.get<boolean>('app.enableSwagger', true);

  app.use(helmet());
  app.enableCors({ origin: corsOrigins, credentials: true });

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: apiPrefix.replace('v', ''),
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  if (enableSwagger) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('FixYa API')
      .setDescription('Sistema Operativo para Servicios — Argentina')
      .setVersion('1.0.0')
      .addBearerAuth()
      .addApiKey({ type: 'apiKey', name: 'X-Tenant-ID', in: 'header' }, 'tenant-id')
      .addTag('Auth', 'Autenticación y sesiones')
      .addTag('Marketplace', 'Catálogo, solicitudes y presupuestos')
      .addTag('Engagements', 'Contrataciones y expediente digital')
      .addTag('Wallet', 'Wallet contable (no custodia)')
      .addTag('Webhooks', 'Integraciones externas')
      .addTag('Health', 'Estado del servicio')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
    logger.log(`Swagger docs: http://localhost:${port}/api/docs`);
  }

  await app.listen(port);
  logger.log(`FixYa API running on http://localhost:${port}/api/${apiPrefix}`);
}

bootstrap();
