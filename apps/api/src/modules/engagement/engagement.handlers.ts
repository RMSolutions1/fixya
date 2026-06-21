import { CommandHandler, ICommandHandler, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import {
  EngagementStatus,
  MemberRole,
  QuotationStatus,
  ServiceRequestStatus,
} from '@fixya/database';
import { PrismaService } from '../../database/prisma.service';
import { EmailService } from '../../common/email/email.service';
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
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
  ) {}

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

    const engagement = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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

    const parties = await this.prisma.engagement.findUnique({
      where: { id: engagement.id },
      select: {
        id: true,
        totalAmount: true,
        client: { select: { email: true, firstName: true } },
        professional: { select: { email: true, firstName: true } },
        serviceRequest: { select: { title: true } },
      },
    });

    if (parties) {
      const amount = Number(parties.totalAmount);
      const title = parties.serviceRequest.title;
      this.email
        .sendEngagementCreated(parties.client.email, parties.client.firstName, 'client', parties.id, title, amount)
        .catch(() => undefined);
      this.email
        .sendEngagementCreated(
          parties.professional.email,
          parties.professional.firstName,
          'professional',
          parties.id,
          title,
          amount,
        )
        .catch(() => undefined);
    }

    return engagement;
  }
}

// ─── Profesional: iniciar trabajo ────────────────────────────────────────────

export class StartEngagementCommand {
  constructor(
    public readonly engagementId: string,
    public readonly professionalId: string,
  ) {}
}

@CommandHandler(StartEngagementCommand)
export class StartEngagementHandler implements ICommandHandler<StartEngagementCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ engagementId, professionalId }: StartEngagementCommand) {
    const eng = await this.prisma.engagement.findFirst({
      where: { id: engagementId, deletedAt: null },
    });
    if (!eng) throw new NotFoundException('Contratación no encontrada');
    if (eng.professionalId !== professionalId) throw new ForbiddenException('No autorizado');
    if (eng.status !== EngagementStatus.FUNDS_HELD) {
      throw new BadRequestException('Solo se puede iniciar cuando los fondos están retenidos');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.engagement.update({
        where: { id: engagementId },
        data: { status: EngagementStatus.IN_PROGRESS },
      });
      await tx.engagementTimelineEvent.create({
        data: {
          engagementId,
          tenantId: eng.tenantId,
          eventType: 'WorkStarted',
          actorId: professionalId,
          payload: {},
        },
      });
      return updated;
    });
  }
}

// ─── Profesional: marcar trabajo como terminado ──────────────────────────────

export class CompleteEngagementCommand {
  constructor(
    public readonly engagementId: string,
    public readonly professionalId: string,
    public readonly note?: string,
  ) {}
}

@CommandHandler(CompleteEngagementCommand)
export class CompleteEngagementHandler implements ICommandHandler<CompleteEngagementCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ engagementId, professionalId, note }: CompleteEngagementCommand) {
    const eng = await this.prisma.engagement.findFirst({
      where: { id: engagementId, deletedAt: null },
    });
    if (!eng) throw new NotFoundException('Contratación no encontrada');
    if (eng.professionalId !== professionalId) throw new ForbiddenException('No autorizado');
    if (
      eng.status !== EngagementStatus.IN_PROGRESS &&
      eng.status !== EngagementStatus.FUNDS_HELD
    ) {
      throw new BadRequestException('Estado inválido para marcar como terminado');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.engagement.update({
        where: { id: engagementId },
        data: { status: EngagementStatus.PENDING_APPROVAL },
      });
      await tx.engagementTimelineEvent.create({
        data: {
          engagementId,
          tenantId: eng.tenantId,
          eventType: 'WorkCompleted',
          actorId: professionalId,
          payload: { note: note ?? null },
        },
      });
      return updated;
    });
  }
}

// ─── Cliente: abrir disputa ──────────────────────────────────────────────────

export class OpenDisputeCommand {
  constructor(
    public readonly engagementId: string,
    public readonly clientId: string,
    public readonly reason: string,
  ) {}
}

@CommandHandler(OpenDisputeCommand)
export class OpenDisputeHandler implements ICommandHandler<OpenDisputeCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ engagementId, clientId, reason }: OpenDisputeCommand) {
    const eng = await this.prisma.engagement.findFirst({
      where: { id: engagementId, deletedAt: null },
    });
    if (!eng) throw new NotFoundException('Contratación no encontrada');
    if (eng.clientId !== clientId) throw new ForbiddenException('No autorizado');

    const openableStatuses: EngagementStatus[] = [
      EngagementStatus.FUNDS_HELD,
      EngagementStatus.IN_PROGRESS,
      EngagementStatus.PENDING_APPROVAL,
    ];
    if (!openableStatuses.includes(eng.status)) {
      throw new BadRequestException('No se puede abrir una disputa en este estado');
    }

    const existing = await this.prisma.dispute.findUnique({ where: { engagementId } });
    if (existing) throw new BadRequestException('Ya existe una disputa abierta');

    return this.prisma.$transaction(async (tx) => {
      const dispute = await tx.dispute.create({
        data: {
          engagementId,
          tenantId: eng.tenantId,
          openedById: clientId,
          reason,
        },
      });
      await tx.engagement.update({
        where: { id: engagementId },
        data: { status: EngagementStatus.DISPUTED },
      });
      await tx.engagementTimelineEvent.create({
        data: {
          engagementId,
          tenantId: eng.tenantId,
          eventType: 'DisputeOpened',
          actorId: clientId,
          payload: { disputeId: dispute.id, reason },
        },
      });
      return dispute;
    });
  }
}

// ─── Lista de engagements por usuario ────────────────────────────────────────

export class ListEngagementsQuery {
  constructor(
    public readonly userId: string,
    public readonly roles: MemberRole[],
  ) {}
}

@QueryHandler(ListEngagementsQuery)
export class ListEngagementsHandler implements IQueryHandler<ListEngagementsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ userId, roles }: ListEngagementsQuery) {
    const isProfessional = roles.includes(MemberRole.PROFESIONAL);
    const where = isProfessional
      ? { professionalId: userId, deletedAt: null }
      : { clientId: userId, deletedAt: null };

    return this.prisma.engagement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        serviceRequest: { select: { title: true, description: true } },
        client: { select: { firstName: true, lastName: true } },
        professional: { select: { firstName: true, lastName: true } },
        payment: { select: { status: true, amount: true } },
        walletAccount: { select: { heldAmount: true, releasedAmount: true } },
      },
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
