import { registerAs } from '@nestjs/config';

function requireInProduction(value: string | undefined, name: string, devFallback: string): string {
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    if (!value?.trim()) {
      throw new Error(`${name} es obligatorio en producción`);
    }
    return value;
  }
  return value ?? devFallback;
}

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '4000', 10),
  apiPrefix: process.env.API_PREFIX ?? 'v1',
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:3000').split(','),
  enableSandboxPayments: process.env.ENABLE_SANDBOX_PAYMENTS === 'true',
  enableSwagger: process.env.ENABLE_SWAGGER !== 'false' && process.env.NODE_ENV !== 'production',
}));

export const jwtConfig = registerAs('jwt', () => ({
  secret: requireInProduction(
    process.env.JWT_SECRET,
    'JWT_SECRET',
    'fixya-dev-secret-change-in-production',
  ),
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES ?? '15m',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES ?? '30d',
}));

export const bcryptConfig = registerAs('bcrypt', () => ({
  rounds: parseInt(process.env.BCRYPT_ROUNDS ?? '12', 10),
}));
