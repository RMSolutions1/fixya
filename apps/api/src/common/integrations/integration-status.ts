export interface MercadoPagoIntegrationStatus {
  accessToken: boolean;
  webhookSecret: boolean;
  /** Token + secret válidos — checkout y webhooks operativos */
  ready: boolean;
  /** URL que debe registrarse en el panel de Mercado Pago */
  webhookUrl: string;
}

export interface EmailIntegrationStatus {
  configured: boolean;
}

export interface PlatformIntegrationsStatus {
  mercadopago: MercadoPagoIntegrationStatus;
  email: EmailIntegrationStatus;
}

function buildMpWebhookUrl(apiPublicUrl: string): string {
  const apiBase = apiPublicUrl.replace(/\/+$/, '');
  return /\/api\/v\d+$/.test(apiBase)
    ? `${apiBase}/webhooks/mercadopago`
    : `${apiBase}/api/v1/webhooks/mercadopago`;
}

function isValidMpAccessToken(token: string | undefined): boolean {
  if (!token?.trim()) return false;
  const t = token.trim();
  if (t.includes('PLACEHOLDER') || t.includes('CONFIGURE')) return false;
  if (t.includes('XXXXXXXX')) return false;
  return t.startsWith('APP_USR-') || t.startsWith('TEST-');
}

export function getPlatformIntegrationsStatus(
  env: NodeJS.ProcessEnv = process.env,
): PlatformIntegrationsStatus {
  const mpToken = env.MP_ACCESS_TOKEN?.trim();
  const mpWebhook = env.MP_WEBHOOK_SECRET?.trim();
  const apiPublicUrl =
    env.API_PUBLIC_URL?.trim() ||
    env.APP_PUBLIC_URL?.trim() ||
    'https://fixya.emprenor.com';

  const accessToken = isValidMpAccessToken(mpToken);
  const webhookSecret = Boolean(mpWebhook && mpWebhook.length > 8);

  return {
    mercadopago: {
      accessToken,
      webhookSecret,
      ready: accessToken && webhookSecret,
      webhookUrl: buildMpWebhookUrl(apiPublicUrl),
    },
    email: {
      configured: Boolean(env.RESEND_API_KEY?.trim()),
    },
  };
}
