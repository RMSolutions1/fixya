import { AsyncLocalStorage } from 'async_hooks';
import { MemberRole } from '@fixya/database';

export interface TenantContextData {
  tenantId: string;
  userId: string;
  email: string;
  roles: MemberRole[];
  isSuperAdmin: boolean;
}

const storage = new AsyncLocalStorage<TenantContextData>();

export class TenantContext {
  static run<T>(context: TenantContextData, fn: () => T): T {
    return storage.run(context, fn);
  }

  static get(): TenantContextData | undefined {
    return storage.getStore();
  }

  static require(): TenantContextData {
    const ctx = storage.getStore();
    if (!ctx) {
      throw new Error('TenantContext not initialized');
    }
    return ctx;
  }
}
