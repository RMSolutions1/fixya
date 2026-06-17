import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ComplianceStatus,
  MemberRole,
  ServiceStatus,
  TenantStatus,
  UserStatus,
} from '@fixya/database';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async listPendingProfessionals() {
    const users = await this.prisma.user.findMany({
      where: {
        deletedAt: null,
        status: UserStatus.PENDING_VERIFICATION,
        memberships: { some: { role: MemberRole.PROFESIONAL, isActive: true } },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        city: true,
        province: true,
        address: true,
        createdAt: true,
        complianceDocuments: {
          where: { deletedAt: null },
          select: {
            id: true,
            docType: true,
            status: true,
            documentNumber: true,
            fileUrl: true,
            createdAt: true,
          },
        },
        memberships: {
          where: { role: MemberRole.PROFESIONAL },
          select: {
            tenant: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const userIds = users.map((u) => u.id);
    const services = await this.prisma.service.findMany({
      where: {
        professionalId: { in: userIds },
        deletedAt: null,
      },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });

    const servicesByPro = new Map<string, typeof services>();
    for (const s of services) {
      if (!s.professionalId) continue;
      const list = servicesByPro.get(s.professionalId) ?? [];
      list.push(s);
      servicesByPro.set(s.professionalId, list);
    }

    return users.map((u) => ({
      ...u,
      services: servicesByPro.get(u.id) ?? [],
    }));
  }

  async approveProfessional(userId: string, reviewerId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
        memberships: { some: { role: MemberRole.PROFESIONAL } },
      },
      include: {
        memberships: { where: { role: MemberRole.PROFESIONAL } },
      },
    });

    if (!user) throw new NotFoundException('Profesional no encontrado');

    const tenantId = user.memberships[0]?.tenantId;
    if (!tenantId) throw new BadRequestException('Sin tenant asociado');

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { status: UserStatus.ACTIVE, emailVerified: true },
      });
      await tx.tenant.update({
        where: { id: tenantId },
        data: { status: TenantStatus.ACTIVE },
      });
      await tx.service.updateMany({
        where: { professionalId: userId, deletedAt: null },
        data: { status: ServiceStatus.ACTIVE },
      });
      await tx.complianceDocument.updateMany({
        where: { userId, status: ComplianceStatus.PENDING_REVIEW },
        data: {
          status: ComplianceStatus.APPROVED,
          reviewedAt: new Date(),
          reviewNote: `Aprobado por administración (${reviewerId})`,
        },
      });
    });

    return { ok: true, userId };
  }

  async rejectProfessional(userId: string, reviewerId: string, note?: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    });
    if (!user) throw new NotFoundException('Profesional no encontrado');

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { status: UserStatus.SUSPENDED },
      });
      await tx.service.updateMany({
        where: { professionalId: userId },
        data: { status: ServiceStatus.ARCHIVED },
      });
      await tx.complianceDocument.updateMany({
        where: { userId, status: ComplianceStatus.PENDING_REVIEW },
        data: {
          status: ComplianceStatus.REJECTED,
          reviewedAt: new Date(),
          reviewNote: note ?? `Rechazado por administración (${reviewerId})`,
        },
      });
    });

    return { ok: true, userId };
  }
}
