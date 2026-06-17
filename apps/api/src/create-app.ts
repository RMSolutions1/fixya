import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { validateProductionEnv } from './config/validate-env';

export async function createApp(): Promise<Express> {
  validateProductionEnv();

  const expressApp = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), {
    logger: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : undefined,
  });

  const config = app.get(ConfigService);
  const apiPrefix = config.get<string>('app.apiPrefix', 'v1');
  const corsOrigins = config.get<string[]>('app.corsOrigins', ['http://localhost:3000']);
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
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  await app.init();
  return expressApp;
}
