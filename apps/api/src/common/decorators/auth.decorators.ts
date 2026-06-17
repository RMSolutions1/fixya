import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { MemberRole } from '@fixya/database';
import { JwtPayload } from '../../modules/auth/interfaces/jwt-payload.interface';

export const ROLES_KEY = 'roles';
export const IS_PUBLIC_KEY = 'isPublic';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
export const Roles = (...roles: MemberRole[]) => SetMetadata(ROLES_KEY, roles);

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest<{ user: JwtPayload }>();
    return request.user;
  },
);

export const TenantId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<{ headers: Record<string, string> }>();
    return request.headers['x-tenant-id'] ?? '';
  },
);
