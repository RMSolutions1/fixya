import { getPlatformIntegrationsStatus } from './integration-status';

describe('getPlatformIntegrationsStatus', () => {
  it('marca MP como no listo sin credenciales', () => {
    const status = getPlatformIntegrationsStatus({
      API_PUBLIC_URL: 'https://fixya.emprenor.com',
    } as NodeJS.ProcessEnv);

    expect(status.mercadopago.ready).toBe(false);
    expect(status.mercadopago.webhookUrl).toBe(
      'https://fixya.emprenor.com/api/v1/webhooks/mercadopago',
    );
  });

  it('marca MP listo con token y secret válidos', () => {
    const status = getPlatformIntegrationsStatus({
      MP_ACCESS_TOKEN: 'APP_USR-real-production-token',
      MP_WEBHOOK_SECRET: 'whsec_production_secret',
      API_PUBLIC_URL: 'https://fixya.emprenor.com',
    } as NodeJS.ProcessEnv);

    expect(status.mercadopago.ready).toBe(true);
  });

  it('rechaza token placeholder', () => {
    const status = getPlatformIntegrationsStatus({
      MP_ACCESS_TOKEN: 'APP_USR-PLACEHOLDER-CONFIGURE',
      MP_WEBHOOK_SECRET: 'whsec_ok',
    } as NodeJS.ProcessEnv);

    expect(status.mercadopago.accessToken).toBe(false);
    expect(status.mercadopago.ready).toBe(false);
  });
});
