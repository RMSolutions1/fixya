import { CommandHandler, ICommandHandler, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import {
  EngagementStatus,
  QuotationStatus,
  ServiceRequestStatus,
} from '@fixya/database';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@fixya/database';

export class AcceptQuotationCommand {
  constructor(
    public readonly quotationId: string,
    public readonly clientId: string,
  ) {}
}

@CommandHandler(AcceptQuotationCommand)
export class AcceptQuotationHandler
  implements ICommandHandler<AcceptQuotationCommand>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: AcceptQuotationCommand) {
    const { quotationId, clientId } = command;

    const quotation = await this.prisma.quotation.findFirst({
      where: { id: quotationId, deletedAt: null },
      include: { serviceRequest: true },
    });

    if (!quotation) throw new NotFoundException('Presupuesto no encontrado');
    if (quotation.serviceRequest.clientId !== clientId) {
      throw new ForbiddenException('No autorizado');
    }
    if (quotation.status !== QuotationStatus.SUBMITTED) {
      throw new BadRequestException('Presupuesto no disponible');
    }
    if (quotation.validUntil < new Date()) {
      throw new BadRequestException('Presupuesto vencido');
    }

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.quotation.update({
        where: { id: quotationId },
        data: { status: QuotationStatus.ACCEPTED },
      });

      await tx.quotation.updateMany({
        where: {
          serviceRequestId: quotation.serviceRequestId,
          id: { not: quotationId },
          status: QuotationStatus.SUBMITTED,
        },
        data: { status: QuotationStatus.REJECTED },
      });

      const engagement = await tx.engagement.create({
        data: {
          tenantId: quotation.tenantId,
          serviceRequestId: quotation.serviceRequestId,
          quotationId: quotation.id,
          clientId,
          professionalId: quotation.professionalId,
          status: EngagementStatus.QUOTE_SELECTED,
          totalAmount: quotation.totalAmount,
          currency: quotation.currency,
        },
      });

      await tx.serviceRequest.update({
        where: { id: quotation.serviceRequestId },
        data: { status: ServiceRequestStatus.CLOSED },
      });

      await tx.engagementTimelineEvent.create({
        data: {
          engagementId: engagement.id,
          tenantId: quotation.tenantId,
          eventType: 'QuotationAccepted',
          actorId: clientId,
          payload: { quotationId, totalAmount: quotation.totalAmount },
        },
      });

      await tx.outboxEvent.create({
        data: {
          tenantId: quotation.tenantId,
          aggregateType: 'Engagement',
          aggregateId: engagement.id,
          eventType: 'QuotationAccepted',
          payload: { engagementId: engagement.id },
        },
      });

      return engagement;
    });
  }
}

export class GetEngagementExpedienteQuery {
  constructor(public readonly engagementId: string) {}
}

@QueryHandler(GetEngagementExpedienteQuery)
export class GetEngagementExpedienteHandler
  implements IQueryHandler<GetEngagementExpedienteQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetEngagementExpedienteQuery) {
    const engagement = await this.prisma.engagement.findFirst({
      where: { id: query.engagementId, deletedAt: null },
      include: {
        serviceRequest: true,
        quotation: { include: { items: true } },
        client: { select: { id: true, firstName: true, lastName: true, email: true } },
        professional: { select: { id: true, firstName: true, lastName: true, email: true } },
        contract: { include: { document: true } },
        payment: true,
        project: { include: { tasks: true, milestones: true } },
        walletAccount: true,
        fiscalDocuments: true,
        documents: { include: { versions: { take: 1, orderBy: { version: 'desc' } } } },
        timelineEvents: { orderBy: { createdAt: 'desc' } },
        dispute: true,
      },
    });

    if (!engagement) throw new NotFoundException('Contratación no encontrada');
    return engagement;
  }
}
