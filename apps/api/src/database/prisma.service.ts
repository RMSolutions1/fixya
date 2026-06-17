import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@fixya/database';
import { TenantContext } from '../common/context/tenant.context';

export interface RlsContext {
  tenantId?: string;
  userId?: string;
  isSuperAdmin?: boolean;
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log('PostgreSQL connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /** Ejecuta callback con contexto RLS PostgreSQL */
  async withRlsContext<T>(
    context: RlsContext,
    fn: (tx: PrismaClient) => Promise<T>,
  ): Promise<T> {
    return this.$transaction(async (tx) => {
      const client = tx as PrismaClient;
      if (context.tenantId) {
        await client.$executeRawUnsafe(
          `SELECT set_config('app.current_tenant_id', $1, true)`,
          context.tenantId,
        );
      }
      if (context.userId) {
        await client.$executeRawUnsafe(
          `SELECT set_config('app.current_user_id', $1, true)`,
          context.userId,
        );
      }
      await client.$executeRawUnsafe(
        `SELECT set_config('app.is_super_admin', $1, true)`,
        context.isSuperAdmin ? 'true' : 'false',
      );
      return fn(client);
    });
  }

  /** Usa TenantContext del request actual (AsyncLocalStorage) */
  async withCurrentContext<T>(
    fn: (tx: PrismaClient) => Promise<T>,
  ): Promise<T> {
    const ctx = TenantContext.get();
    return this.withRlsContext(
      {
        tenantId: ctx?.tenantId,
        userId: ctx?.userId,
        isSuperAdmin: ctx?.isSuperAdmin ?? false,
      },
      fn,
    );
  }
}
