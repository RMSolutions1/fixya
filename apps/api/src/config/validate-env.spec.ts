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

  const validProdEnv = () => {
    process.env.JWT_SECRET = 'a'.repeat(32);
    process.env.DATABASE_URL = 'postgresql://x';
    process.env.MP_ACCESS_TOKEN = 'APP_USR-real-token';
    process.env.MP_WEBHOOK_SECRET = 'whsec_real';
    process.env.RESEND_API_KEY = 're_real';
    process.env.APP_PUBLIC_URL = 'https://fixya.com.ar';
    process.env.API_PUBLIC_URL = 'https://api.fixya.com.ar';
    process.env.CORS_ORIGINS = 'https://fixya.com.ar';
    process.env.ENABLE_SANDBOX_PAYMENTS = 'false';
    process.env.MP_SANDBOX = 'false';
    process.env.ENABLE_SWAGGER = 'false';
    process.env.SEED_DEMO_DATA = 'false';
  };

  it('arranca sin MP/Resend pero advierte integraciones pendientes', () => {
    validProdEnv();
    process.env.MP_ACCESS_TOKEN = undefined;
    process.env.MP_WEBHOOK_SECRET = undefined;
    process.env.RESEND_API_KEY = undefined;
    expect(() => validateProductionEnv()).not.toThrow();
  });

  it('falla si hay MP_ACCESS_TOKEN sin MP_WEBHOOK_SECRET', () => {
    validProdEnv();
    process.env.MP_WEBHOOK_SECRET = undefined;
    expect(() => validateProductionEnv()).toThrow(/MP_WEBHOOK_SECRET/);
  });

  it('falla con MP_ACCESS_TOKEN de prueba en producción', () => {
    validProdEnv();
    process.env.MP_ACCESS_TOKEN = 'TEST-123456789';
    expect(() => validateProductionEnv()).toThrow(/TEST-/);
  });

  it('falla con MP_ACCESS_TOKEN placeholder', () => {
    validProdEnv();
    process.env.MP_ACCESS_TOKEN = 'APP_USR-PLACEHOLDER-CONFIGURE';
    expect(() => validateProductionEnv()).toThrow(/placeholder/i);
  });

  it('falla con JWT_SECRET de desarrollo', () => {
    validProdEnv();
    process.env.JWT_SECRET = 'dev-secret-change-in-production';
    expect(() => validateProductionEnv()).toThrow(/JWT_SECRET/);
  });

  it('falla si sandbox está activo en producción', () => {
    validProdEnv();
    process.env.ENABLE_SANDBOX_PAYMENTS = 'true';
    expect(() => validateProductionEnv()).toThrow(/SANDBOX/);
  });

  it('pasa con configuración de producción válida', () => {
    validProdEnv();
    expect(() => validateProductionEnv()).not.toThrow();
  });
});
