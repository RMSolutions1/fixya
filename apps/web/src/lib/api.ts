import { useAuthStore } from '@/stores/auth.store';
import { SITE_URL } from '@/lib/site-url';

function getApiUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api/v1`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api/v1`;
  }
  return `${SITE_URL}/api/v1`;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  token?: string | null;
  tenantId?: string | null;
  /** Evita reintentar refresh en cadena */
  _retried?: boolean;
}

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken, tenantId, setAuth, logout } = useAuthStore.getState();
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${getApiUrl()}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      logout();
      return null;
    }

    setAuth({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      tenantId: tenantId ?? '',
    });

    return data.accessToken as string;
  } catch {
    logout();
    return null;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, token, tenantId, headers: customHeaders, _retried, ...rest } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (tenantId) headers['X-Tenant-ID'] = tenantId;

  const response = await fetch(`${getApiUrl()}${path}`, {
    ...rest,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (response.status === 401 && token && !_retried) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      const store = useAuthStore.getState();
      return apiRequest<T>(path, {
        ...options,
        token: newToken,
        tenantId: tenantId ?? store.tenantId,
        _retried: true,
      });
    }
  }

  if (!response.ok) {
    const message =
      typeof data.message === 'string'
        ? data.message
        : Array.isArray(data.message)
          ? data.message.join(', ')
          : 'Error en la solicitud';
    throw new ApiError(response.status, message, data);
  }

  return data as T;
}

export function getApiBaseUrl(): string {
  return getApiUrl();
}
