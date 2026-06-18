import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { EmailService } from '../../common/email/email.service';
import {
  ComplianceDocType,
  ComplianceStatus,
  MemberRole,
  ServiceStatus,
  TenantType,
  TenantStatus,
  UserStatus,
} from '@fixya/database';
import { PrismaService } from '../../database/prisma.service';
import { RegisterDto, LoginDto, UpdateProfileDto, UploadComplianceDto } from './dto/auth.dto';
import { JwtPayload, TokenPair } from './interfaces/jwt-payload.interface';
import { coordsForProvince } from '../../common/utils/argentina-geo';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly email: EmailService,
  ) {}

  async register(dto: RegisterDto): Promise<TokenPair> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('Email ya registrado');
    }

    if (dto.role === MemberRole.PROFESIONAL) {
      if (!dto.categoryId) {
        throw new BadRequestException('Seleccioná tu rubro principal');
      }
      if (!dto.documentNumber?.trim()) {
        throw new BadRequestException('Ingresá CUIT o DNI para verificación');
      }
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

    const isProfessional = dto.role === MemberRole.PROFESIONAL;
    const userStatus = isProfessional ? UserStatus.PENDING_VERIFICATION : UserStatus.ACTIVE;
    const tenantStatus = isProfessional ? TenantStatus.PENDING : TenantStatus.ACTIVE;

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email.toLowerCase(),
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          city: dto.city,
          province: dto.province,
          address: dto.address,
          status: userStatus,
          emailVerified: false,
        },
      });

      const tenant = await tx.tenant.create({
        data: {
          slug,
          name: `${dto.firstName} ${dto.lastName}`,
          type: tenantType,
          status: tenantStatus,
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

      if (isProfessional && dto.categoryId) {
        const coords = coordsForProvince(dto.province);
        const category = await tx.serviceCategory.findUnique({
          where: { id: dto.categoryId },
        });
        const serviceSlug = `${slug}-${category?.slug ?? 'servicio'}`;

        await tx.service.create({
          data: {
            tenantId: tenant.id,
            categoryId: dto.categoryId,
            professionalId: user.id,
            title: `${dto.firstName} ${dto.lastName} — ${category?.name ?? 'Servicios'}`,
            slug: serviceSlug.slice(0, 250),
            description: `Perfil profesional de ${dto.firstName} ${dto.lastName} en ${dto.city}, ${dto.province}.`,
            status: ServiceStatus.DRAFT,
            latitude: coords.lat,
            longitude: coords.lng,
            coverageRadiusKm: 25,
            metadata: {
              licenseNumber: dto.licenseNumber ?? null,
              pendingApproval: true,
            },
          },
        });

        await tx.complianceDocument.create({
          data: {
            tenantId: tenant.id,
            userId: user.id,
            docType: ComplianceDocType.CUIT_CONSTANCIA,
            status: ComplianceStatus.PENDING_REVIEW,
            documentNumber: dto.documentNumber,
            fileUrl: 'pending://registration',
          },
        });

        if (dto.licenseNumber) {
          await tx.complianceDocument.create({
            data: {
              tenantId: tenant.id,
              userId: user.id,
              docType: ComplianceDocType.MATRICULA,
              status: ComplianceStatus.PENDING_REVIEW,
              documentNumber: dto.licenseNumber,
              fileUrl: 'pending://registration',
            },
          });
        }
      }

      return { user, tenant };
    });

    const tokens = await this.generateTokens(result.user.id, result.user.email, result.tenant.id, [
      dto.role,
    ]);

    // Email de bienvenida — no bloqueante
    this.email.sendWelcome(result.user.email, result.user.firstName).catch(() => undefined);

    return tokens;
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
        address: true,
        city: true,
        province: true,
        avatarUrl: true,
        status: true,
        mfaEnabled: true,
        memberships: {
          where: { isActive: true },
          select: {
            role: true,
            isDefault: true,
            tenant: { select: { id: true, slug: true, name: true, type: true, status: true } },
          },
        },
      },
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        phone: dto.phone,
        address: dto.address,
        city: dto.city,
        province: dto.province,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        city: true,
        province: true,
        status: true,
      },
    });
  }

  async uploadCompliance(userId: string, tenantId: string, dto: UploadComplianceDto) {
    const existing = await this.prisma.complianceDocument.findFirst({
      where: { tenantId, userId, docType: dto.docType, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    if (existing) {
      return this.prisma.complianceDocument.update({
        where: { id: existing.id },
        data: {
          fileUrl: dto.fileUrl,
          documentNumber: dto.documentNumber ?? existing.documentNumber,
          status: ComplianceStatus.PENDING_REVIEW,
        },
      });
    }

    return this.prisma.complianceDocument.create({
      data: {
        tenantId,
        userId,
        docType: dto.docType,
        fileUrl: dto.fileUrl,
        documentNumber: dto.documentNumber,
        status: ComplianceStatus.PENDING_REVIEW,
      },
    });
  }

  async forgotPassword(email: string): Promise<{ message: string; devToken?: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase(), deletedAt: null },
    });

    const genericMessage =
      'Si el email está registrado, te enviamos instrucciones para restablecer tu contraseña.';

    if (!user) return { message: genericMessage };

    await this.prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    const token = randomBytes(32).toString('hex');
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashToken(token),
        expiresAt: new Date(Date.now() + 3600_000),
      },
    });

    const isProd = this.config.get<string>('app.nodeEnv') === 'production';

    // Enviar email con el enlace de recuperación (no bloqueante)
    this.email
      .sendPasswordReset(user.email, user.firstName, token)
      .catch(() => undefined);

    return {
      message: genericMessage,
      ...(isProd ? {} : { devToken: token }),
    };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const stored = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash: this.hashToken(token) },
    });

    if (!stored || stored.usedAt || stored.expiresAt < new Date()) {
      throw new BadRequestException('El enlace de recuperación es inválido o expiró');
    }

    const rounds = this.config.get<number>('bcrypt.rounds', 10);
    const passwordHash = await bcrypt.hash(newPassword, rounds);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: stored.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: stored.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId: stored.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    return { message: 'Contraseña actualizada. Ya podés ingresar.' };
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
