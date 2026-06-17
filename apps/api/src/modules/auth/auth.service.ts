import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { MemberRole, TenantType, TenantStatus, UserStatus } from '@fixya/database';
import { PrismaService } from '../../database/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { JwtPayload, TokenPair } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<TokenPair> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('Email ya registrado');
    }

    const rounds = this.config.get<number>('bcrypt.rounds', 12);
    const passwordHash = await bcrypt.hash(dto.password, rounds);

    const slug = `${dto.firstName}-${dto.lastName}-${Date.now()}`
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '');

    const tenantType =
      dto.role === MemberRole.EMPRESA
        ? TenantType.EMPRESA
        : dto.role === MemberRole.PROFESIONAL
          ? TenantType.PROFESIONAL
          : TenantType.EMPRESA;

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email.toLowerCase(),
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          status: UserStatus.ACTIVE,
          emailVerified: false,
        },
      });

      const tenant = await tx.tenant.create({
        data: {
          slug,
          name: `${dto.firstName} ${dto.lastName}`,
          type: tenantType,
          status: TenantStatus.ACTIVE,
        },
      });

      await tx.tenantMember.create({
        data: {
          tenantId: tenant.id,
          userId: user.id,
          role: dto.role,
          isDefault: true,
          isActive: true,
        },
      });

      return { user, tenant };
    });

    return this.generateTokens(result.user.id, result.user.email, result.tenant.id, [
      dto.role,
    ]);
  }

  async login(dto: LoginDto): Promise<TokenPair & { tenantId: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase(), deletedAt: null },
      include: {
        memberships: {
          where: { isActive: true, deletedAt: null },
          include: { tenant: true },
        },
      },
    });

    if (!user || user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const membership = dto.tenantId
      ? user.memberships.find((m) => m.tenantId === dto.tenantId)
      : user.memberships.find((m) => m.isDefault) ?? user.memberships[0];

    if (!membership) {
      throw new UnauthorizedException('Sin acceso al tenant solicitado');
    }

    const isSuperAdmin = membership.role === MemberRole.SUPER_ADMIN;

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(
      user.id,
      user.email,
      membership.tenantId,
      [membership.role],
      isSuperAdmin,
    );

    return { ...tokens, tenantId: membership.tenantId };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    const hash = this.hashToken(refreshToken);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: hash },
      include: {
        user: {
          include: {
            memberships: {
              where: { isActive: true, isDefault: true },
            },
          },
        },
      },
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const membership = stored.user.memberships[0];
    if (!membership) {
      throw new UnauthorizedException('Sin membresía activa');
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return this.generateTokens(
      stored.user.id,
      stored.user.email,
      membership.tenantId,
      [membership.role],
      membership.role === MemberRole.SUPER_ADMIN,
    );
  }

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        mfaEnabled: true,
        memberships: {
          where: { isActive: true },
          select: {
            role: true,
            isDefault: true,
            tenant: { select: { id: true, slug: true, name: true, type: true } },
          },
        },
      },
    });
  }

  private async generateTokens(
    userId: string,
    email: string,
    tenantId: string,
    roles: MemberRole[],
    isSuperAdmin = false,
  ): Promise<TokenPair> {
    const payload: JwtPayload = {
      sub: userId,
      email,
      tenantId,
      roles,
      isSuperAdmin,
    };

    const accessExpiresIn = this.config.get<string>('jwt.accessExpiresIn', '15m');
    const refreshExpiresIn = this.config.get<string>('jwt.refreshExpiresIn', '30d');

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: accessExpiresIn as `${number}${'s' | 'm' | 'h' | 'd'}`,
    });

    const refreshToken = randomBytes(64).toString('hex');
    const refreshDays = parseInt(refreshExpiresIn.replace('d', ''), 10) || 30;

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: this.hashToken(refreshToken),
        expiresAt: new Date(Date.now() + refreshDays * 86400000),
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900,
    };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
