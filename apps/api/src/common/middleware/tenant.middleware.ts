import {
  Injectable,
  NestMiddleware,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MemberRole } from '@fixya/database';
import { TenantContext } from '../context/tenant.context';
import { JwtPayload } from '../../modules/auth/interfaces/jwt-payload.interface';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const user = req.user as JwtPayload | undefined;

    if (!user) {
      return next();
    }

    const headerTenantId = req.headers['x-tenant-id'] as string | undefined;
    const tenantId = headerTenantId ?? user.tenantId;

    if (!tenantId) {
      throw new BadRequestException('X-Tenant-ID requerido');
    }

    TenantContext.run(
      {
        tenantId,
        userId: user.sub,
        email: user.email,
        roles: user.roles as MemberRole[],
        isSuperAdmin: user.isSuperAdmin,
      },
      () => next(),
    );
  }
}
