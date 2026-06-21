import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { getPlatformIntegrationsStatus } from '../../common/integrations/integration-status';

@Injectable()
export class AdminFinanceService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const [walletAgg, paymentGroups, engagementCounts, commissionRules] = await Promise.all([
      this.prisma.walletAccount.aggregate({
        _sum: {
          heldAmount: true,
          releasedAmount: true,
          commissionAmount: true,
          warrantyHeld: true,
        },
        _count: true,
      }),
      this.prisma.payment.groupBy({
        by: ['status'],
        _count: true,
        _sum: { amount: true },
      }),
      this.prisma.engagement.groupBy({
        by: ['status'],
        where: { deletedAt: null },
        _count: true,
      }),
      this.prisma.commissionRule.findMany({
        where: { isActive: true },
        orderBy: [{ isGlobal: 'desc' }, { name: 'asc' }],
      }),
    ]);

    const payments = paymentGroups.map((p) => ({
      status: p.status,
      count: p._count,
      totalAmount: Number(p._sum.amount ?? 0),
    }));

    return {
      wallet: {
        accounts: walletAgg._count,
        held: Number(walletAgg._sum.heldAmount ?? 0),
        released: Number(walletAgg._sum.releasedAmount ?? 0),
        commission: Number(walletAgg._sum.commissionAmount ?? 0),
        warranty: Number(walletAgg._sum.warrantyHeld ?? 0),
        currency: 'ARS',
      },
      payments,
      engagements: engagementCounts.map((e) => ({
        status: e.status,
        count: e._count,
      })),
      commissionRules: commissionRules.map((r) => ({
        id: r.id,
        name: r.name,
        ratePercent: Number(r.ratePercent),
        isGlobal: r.isGlobal,
        isActive: r.isActive,
      })),
      integrations: getPlatformIntegrationsStatus(),
    };
  }

  async listWalletAccounts(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.walletAccount.findMany({
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          tenant: { select: { id: true, name: true, slug: true } },
          engagement: {
            select: {
              id: true,
              status: true,
              totalAmount: true,
              currency: true,
              client: { select: { id: true, firstName: true, lastName: true, email: true } },
              professional: { select: { id: true, firstName: true, lastName: true } },
            },
          },
        },
      }),
      this.prisma.walletAccount.count(),
    ]);

    return {
      items: items.map((a) => ({
        id: a.id,
        tenant: a.tenant,
        engagementId: a.engagementId,
        engagementStatus: a.engagement.status,
        totalAmount: Number(a.engagement.totalAmount),
        currency: a.currency,
        status: a.status,
        heldAmount: Number(a.heldAmount),
        releasedAmount: Number(a.releasedAmount),
        commissionAmount: Number(a.commissionAmount),
        warrantyHeld: Number(a.warrantyHeld),
        client: a.engagement.client,
        professional: a.engagement.professional,
        updatedAt: a.updatedAt,
      })),
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }

  async listPayments(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.payment.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          engagement: {
            select: {
              id: true,
              status: true,
              client: { select: { firstName: true, lastName: true } },
              professional: { select: { firstName: true, lastName: true } },
            },
          },
        },
      }),
      this.prisma.payment.count(),
    ]);

    return {
      items: items.map((p) => ({
        id: p.id,
        engagementId: p.engagementId,
        status: p.status,
        amount: Number(p.amount),
        currency: p.currency,
        mpPaymentId: p.mpPaymentId,
        mpPreferenceId: p.mpPreferenceId,
        paidAt: p.paidAt,
        createdAt: p.createdAt,
        engagement: p.engagement,
      })),
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }

  async listLedger(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [entries, total] = await Promise.all([
      this.prisma.ledgerEntry.findMany({
        skip,
        take: limit,
        orderBy: { postedAt: 'desc' },
        include: {
          lines: true,
          walletAccount: {
            select: {
              engagementId: true,
              tenant: { select: { name: true, slug: true } },
            },
          },
        },
      }),
      this.prisma.ledgerEntry.count(),
    ]);

    return {
      entries,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }

  async updateCommissionRule(id: string, ratePercent: number) {
    const rule = await this.prisma.commissionRule.findUnique({ where: { id } });
    if (!rule) throw new NotFoundException('Regla de comisión no encontrada');

    const updated = await this.prisma.commissionRule.update({
      where: { id },
      data: { ratePercent },
    });

    return {
      id: updated.id,
      name: updated.name,
      ratePercent: Number(updated.ratePercent),
      isGlobal: updated.isGlobal,
    };
  }
}
