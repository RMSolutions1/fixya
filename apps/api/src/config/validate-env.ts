import { Logger } from '@nestjs/common';

const logger = new Logger('ValidateEnv');

export function validateProductionEnv(): void {
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  if (nodeEnv !== 'production') return;

  const required: Array<[string, string | undefined]> = [
    ['JWT_SECRET', process.env.JWT_SECRET],
    ['DATABASE_URL', process.env.DATABASE_URL],
    ['MP_ACCESS_TOKEN', process.env.MP_ACCESS_TOKEN],
    ['APP_PUBLIC_URL', process.env.APP_PUBLIC_URL],
    ['API_PUBLIC_URL', process.env.API_PUBLIC_URL],
    ['CORS_ORIGINS', process.env.CORS_ORIGINS],
  ];

  const missing = required.filter(([, value]) => !value?.trim()).map(([key]) => key);
  if (missing.length > 0) {
    throw new Error(
      `Variables de entorno obligatorias en producción: ${missing.join(', ')}`,
    );
  }

  const jwtSecret = process.env.JWT_SECRET!;
  if (jwtSecret.length < 32 || jwtSecret.includes('dev-secret')) {
    throw new Error('JWT_SECRET debe tener al menos 32 caracteres y no ser un valor de desarrollo');
  }

  if (process.env.ENABLE_SANDBOX_PAYMENTS === 'true') {
    throw new Error('ENABLE_SANDBOX_PAYMENTS no puede estar activo en producción');
  }

  if (process.env.MP_SANDBOX === 'true') {
    throw new Error('MP_SANDBOX debe ser false en producción');
  }

  if (process.env.ENABLE_SWAGGER === 'true') {
    throw new Error('ENABLE_SWAGGER debe ser false en producción');
  }

  if (process.env.SEED_DEMO_DATA === 'true') {
    throw new Error('SEED_DEMO_DATA no puede estar activo en producción');
  }

  logger.log('Validación de entorno de producción OK');
}
