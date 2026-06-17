/** URL pública del sitio (Vercel: NEXT_PUBLIC_SITE_URL). */
const DEFAULT_SITE_URL = 'https://fixya.emprenor.com';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL).replace(/\/$/, '');

export const SITE_HOST = new URL(SITE_URL).hostname;
