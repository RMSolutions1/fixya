'use client';

import { useAuthStore } from '@/stores/auth.store';
import { apiRequest } from '@/lib/api';
import type { LoginForm, RegisterForm } from '@/lib/validators/auth';
import type { AuthUser } from '@/stores/auth.store';

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tenantId?: string;
}

export function useAuth() {
  const store = useAuthStore();

  const login = async (data: LoginForm) => {
    const res = await apiRequest<TokenResponse & { tenantId: string }>('/auth/login', {
      method: 'POST',
      body: data,
    });
    store.setAuth({
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
      tenantId: res.tenantId,
    });
    const profile = await apiRequest<AuthUser>('/auth/me', {
      token: res.accessToken,
      tenantId: res.tenantId,
    });
    store.setUser(profile);
    return res;
  };

  const register = async (data: RegisterForm) => {
    const res = await apiRequest<TokenResponse>('/auth/register', {
      method: 'POST',
      body: data,
    });
    const profile = await apiRequest<AuthUser>('/auth/me', {
      token: res.accessToken,
    });
    const tenantId = profile.memberships?.[0]?.tenant.id ?? '';
    store.setAuth({
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
      tenantId,
      user: profile,
    });
    return res;
  };

  const logout = () => store.logout();

  return {
    ...store,
    login,
    register,
    logout,
  };
}

export function useApiAuth() {
  const { accessToken, tenantId } = useAuthStore();
  return { token: accessToken, tenantId };
}
