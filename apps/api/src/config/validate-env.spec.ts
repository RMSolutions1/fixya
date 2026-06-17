import { validateProductionEnv } from './validate-env';

describe('validateProductionEnv', () => {
  const env = process.env;

  beforeEach(() => {
    process.env = { ...env, NODE_ENV: 'production' };
  });

  afterAll(() => {
    process.env = env;
  });

  it('no valida en desarrollo', () => {
    process.env.NODE_ENV = 'development';
    expect(() => validateProductionEnv()).not.toThrow();
  });

  it('falla si faltan variables obligatorias', () => {
    process.env.JWT_SECRET = undefined;
    expect(() => validateProductionEnv()).toThrow(/JWT_SECRET/);
  });

  it('falla con JWT_SECRET de desarrollo', () => {
    process.env.JWT_SECRET = 'dev-secret-change-in-production';
    process.env.DATABASE_URL = 'postgresql://x';
    process.env.MP_ACCESS_TOKEN = 'mp-token';
    process.env.APP_PUBLIC_URL = 'https://fixya.com.ar';
    process.env.API_PUBLIC_URL = 'https://api.fixya.com.ar';
    process.env.CORS_ORIGINS = 'https://fixya.com.ar';
    expect(() => validateProductionEnv()).toThrow(/JWT_SECRET/);
  });

  it('falla si sandbox está activo en producción', () => {
    process.env.JWT_SECRET = 'a'.repeat(32);
    process.env.DATABASE_URL = 'postgresql://x';
    process.env.MP_ACCESS_TOKEN = 'mp-token';
    process.env.APP_PUBLIC_URL = 'https://fixya.com.ar';
    process.env.API_PUBLIC_URL = 'https://api.fixya.com.ar';
    process.env.CORS_ORIGINS = 'https://fixya.com.ar';
    process.env.ENABLE_SANDBOX_PAYMENTS = 'true';
    expect(() => validateProductionEnv()).toThrow(/SANDBOX/);
  });

  it('pasa con configuración de producción válida', () => {
    process.env.JWT_SECRET = 'a'.repeat(32);
    process.env.DATABASE_URL = 'postgresql://x';
    process.env.MP_ACCESS_TOKEN = 'mp-token-prod';
    process.env.APP_PUBLIC_URL = 'https://fixya.com.ar';
    process.env.API_PUBLIC_URL = 'https://api.fixya.com.ar';
    process.env.CORS_ORIGINS = 'https://fixya.com.ar';
    process.env.ENABLE_SANDBOX_PAYMENTS = 'false';
    process.env.MP_SANDBOX = 'false';
    process.env.ENABLE_SWAGGER = 'false';
    process.env.SEED_DEMO_DATA = 'false';
    expect(() => validateProductionEnv()).not.toThrow();
  });
});
