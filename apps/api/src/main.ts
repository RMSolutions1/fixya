import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { createApp } from './create-app';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const expressApp = await createApp();
  const port = Number(process.env.PORT ?? 4000);
  const apiPrefix = process.env.API_PREFIX ?? 'v1';

  expressApp.listen(port, () => {
    logger.log(`FixYa API running on http://localhost:${port}/api/${apiPrefix}`);
  });
}

bootstrap();
