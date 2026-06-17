import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export class GetWalletBalanceQuery {
  constructor(
    public readonly tenantId: string,
    public readonly engagementId?: string,
  ) {}
}

@QueryHandler(GetWalletBalanceQuery)
export class GetWalletBalanceHandler
  implements IQueryHandler<GetWalletBalanceQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetWalletBalanceQuery) {
    if (query.engagementId) {
      const account = await this.prisma.walletAccount.findFirst({
        where: { engagementId: query.engagementId, tenantId: query.tenantId },
      });
      if (!account) throw new NotFoundException('Cuenta wallet no encontrada');
      return account;
    }

    const accounts = await this.prisma.walletAccount.findMany({
      where: { tenantId: query.tenantId },
      select: {
        id: true,
        engagementId: true,
        status: true,
        heldAmount: true,
        releasedAmount: true,
        commissionAmount: true,
        warrantyHeld: true,
        currency: true,
      },
    });

    const summary = accounts.reduce(
      (acc, a) => ({
        held: acc.held + Number(a.heldAmount),
        released: acc.released + Number(a.releasedAmount),
        commission: acc.commission + Number(a.commissionAmount),
        warranty: acc.warranty + Number(a.warrantyHeld),
      }),
      { held: 0, released: 0, commission: 0, warranty: 0 },
    );

    return { accounts, summary, currency: 'ARS' };
  }
}

export class GetLedgerQuery {
  constructor(
    public readonly tenantId: string,
    public readonly page = 1,
    public readonly limit = 50,
  ) {}
}

@QueryHandler(GetLedgerQuery)
export class GetLedgerHandler implements IQueryHandler<GetLedgerQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetLedgerQuery) {
    const skip = (query.page - 1) * query.limit;

    const [entries, total] = await Promise.all([
      this.prisma.ledgerEntry.findMany({
        where: { tenantId: query.tenantId },
        skip,
        take: query.limit,
        orderBy: { postedAt: 'desc' },
        include: { lines: true },
      }),
      this.prisma.ledgerEntry.count({ where: { tenantId: query.tenantId } }),
    ]);

    return {
      entries,
      meta: { total, page: query.page, limit: query.limit },
    };
  }
}
