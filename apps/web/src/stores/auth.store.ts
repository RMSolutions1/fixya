import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  status?: string;
  memberships?: Array<{
    role: string;
    isDefault: boolean;
    tenant: { id: string; slug: string; name: string; type: string; status?: string };
  }>;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  tenantId: string | null;
  user: AuthUser | null;
  setAuth: (data: {
    accessToken: string;
    refreshToken: string;
    tenantId: string;
    user?: AuthUser;
  }) => void;
  setUser: (user: AuthUser) => void;
  setTenantId: (tenantId: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      tenantId: null,
      user: null,

      setAuth: ({ accessToken, refreshToken, tenantId, user }) =>
        set({ accessToken, refreshToken, tenantId, user: user ?? null }),

      setUser: (user) => set({ user }),

      setTenantId: (tenantId) => set({ tenantId }),

      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          tenantId: null,
          user: null,
        }),

      isAuthenticated: () => !!get().accessToken,
    }),
    { name: 'fixya-auth' },
  ),
);
