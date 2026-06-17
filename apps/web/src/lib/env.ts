export const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export const SANDBOX_PAYMENTS_ENABLED =
  !IS_PRODUCTION && process.env.NEXT_PUBLIC_ENABLE_SANDBOX_PAYMENTS === 'true';
