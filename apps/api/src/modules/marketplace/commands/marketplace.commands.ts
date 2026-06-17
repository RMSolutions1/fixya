import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { EngagementStatus, ServiceRequestStatus } from '@fixya/database';
import { PrismaService } from '../../../database/prisma.service';
import { TenantContext } from '../../../common/context/tenant.context';
import { CreateServiceRequestDto, CreateReviewDto } from '../dto/marketplace.dto';

/** Estados de contratación que habilitan reseña del cliente */
const REVIEWABLE_STATUSES: EngagementStatus[] = [
  EngagementStatus.FUNDS_RELEASED,
  EngagementStatus.WARRANTY,
  EngagementStatus.CLOSED,
  EngagementStatus.PENDING_APPROVAL,
];

export class CreateServiceRequestCommand {
  constructor(
    public readonly clientId: string,
    public readonly dto: CreateServiceRequestDto,
  ) {}
}

@CommandHandler(CreateServiceRequestCommand)
export class CreateServiceRequestHandler
  implements ICommandHandler<CreateServiceRequestCommand>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: CreateServiceRequestCommand) {
    const ctx = TenantContext.get();
    const { clientId, dto } = command;

    const client = await this.prisma.user.findUnique({
      where: { id: clientId },
      select: { address: true, city: true, province: true },
    });

    return this.prisma.withCurrentContext(async (tx) => {
      const request = await tx.serviceRequest.create({
        data: {
          clientId,
          categoryId: dto.categoryId,
          title: dto.title,
          description: dto.description,
          status: ServiceRequestStatus.DRAFT,
          budgetMin: dto.budgetMin,
          budgetMax: dto.budgetMax,
          latitude: dto.latitude,
          longitude: dto.longitude,
          address: dto.address ?? client?.address ?? undefined,
          city: dto.city ?? client?.city ?? undefined,
          province: dto.province ?? client?.province ?? undefined,
        },
      });
      return request;
    });
  }
}

export class PublishServiceRequestCommand {
  constructor(
    public readonly requestId: string,
    public readonly clientId: string,
  ) {}
}

@CommandHandler(PublishServiceRequestCommand)
export class PublishServiceRequestHandler
  implements ICommandHandler<PublishServiceRequestCommand>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: PublishServiceRequestCommand) {
    const { requestId, clientId } = command;

    const request = await this.prisma.serviceRequest.findFirst({
      where: { id: requestId, clientId, deletedAt: null },
    });

    if (!request) throw new NotFoundException('Solicitud no encontrada');
    if (request.status !== ServiceRequestStatus.DRAFT) {
      throw new ForbiddenException('Solo borradores pueden publicarse');
    }

    return this.prisma.serviceRequest.update({
      where: { id: requestId },
      data: {
        status: ServiceRequestStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });
  }
}

export class CreateReviewCommand {
  constructor(
    public readonly reviewerId: string,
    public readonly dto: CreateReviewDto,
  ) {}
}

@CommandHandler(CreateReviewCommand)
export class CreateReviewHandler implements ICommandHandler<CreateReviewCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: CreateReviewCommand) {
    const { reviewerId, dto } = command;

    const engagement = await this.prisma.engagement.findFirst({
      where: { id: dto.engagementId, deletedAt: null },
      include: { serviceRequest: { select: { categoryId: true } } },
    });

    if (!engagement) throw new NotFoundException('Contratación no encontrada');
    if (engagement.clientId !== reviewerId) {
      throw new ForbiddenException('Solo el cliente de la contratación puede reseñar');
    }
    if (!REVIEWABLE_STATUSES.includes(engagement.status)) {
      throw new BadRequestException(
        'Podés reseñar una vez completado el servicio',
      );
    }

    const existing = await this.prisma.serviceReview.findUnique({
      where: { engagementId: dto.engagementId },
    });
    if (existing) {
      throw new BadRequestException('Ya reseñaste esta contratación');
    }

    const service =
      (await this.prisma.service.findFirst({
        where: {
          professionalId: engagement.professionalId,
          categoryId: engagement.serviceRequest.categoryId,
          deletedAt: null,
        },
      })) ??
      (await this.prisma.service.findFirst({
        where: { professionalId: engagement.professionalId, deletedAt: null },
      }));

    if (!service) throw new NotFoundException('Servicio del profesional no encontrado');

    return this.prisma.$transaction(async (tx) => {
      const review = await tx.serviceReview.create({
        data: {
          serviceId: service.id,
          reviewerId,
          engagementId: dto.engagementId,
          rating: dto.rating,
          comment: dto.comment,
        },
      });

      const agg = await tx.serviceReview.aggregate({
        where: { serviceId: service.id, deletedAt: null },
        _avg: { rating: true },
        _count: { _all: true },
      });

      await tx.service.update({
        where: { id: service.id },
        data: {
          ratingAvg: agg._avg.rating ?? 0,
          ratingCount: agg._count._all,
        },
      });

      await tx.engagementTimelineEvent.create({
        data: {
          engagementId: engagement.id,
          tenantId: engagement.tenantId,
          eventType: 'ReviewCreated',
          actorId: reviewerId,
          payload: { rating: dto.rating, serviceId: service.id },
        },
      });

      return review;
    });
  }
}

export class SubmitQuotationCommand {
  constructor(
    public readonly professionalId: string,
    public readonly tenantId: string,
    public readonly dto: import('../dto/marketplace.dto').SubmitQuotationDto,
  ) {}
}

@CommandHandler(SubmitQuotationCommand)
export class SubmitQuotationHandler
  implements ICommandHandler<SubmitQuotationCommand>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: SubmitQuotationCommand) {
    const { professionalId, tenantId, dto } = command;

    const professional = await this.prisma.user.findUnique({
      where: { id: professionalId },
      select: { status: true },
    });
    if (!professional || professional.status !== 'ACTIVE') {
      throw new ForbiddenException(
        'Tu perfil debe estar verificado por un administrador antes de enviar presupuestos.',
      );
    }

    const request = await this.prisma.serviceRequest.findFirst({
      where: {
        id: dto.serviceRequestId,
        status: ServiceRequestStatus.PUBLISHED,
        deletedAt: null,
      },
    });

    if (!request) throw new NotFoundException('Solicitud no disponible');

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 7);

    return this.prisma.$transaction(async (tx) => {
      const quotation = await tx.quotation.create({
        data: {
          tenantId,
          serviceRequestId: dto.serviceRequestId,
          professionalId,
          totalAmount: dto.totalAmount,
          estimatedDays: dto.estimatedDays,
          notes: dto.notes,
          validUntil,
          submittedAt: new Date(),
          status: 'SUBMITTED',
          items: {
            create: dto.items.map((item, i) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.quantity * item.unitPrice,
              sortOrder: i,
            })),
          },
        },
        include: { items: true },
      });

      await tx.serviceRequest.update({
        where: { id: dto.serviceRequestId },
        data: { status: ServiceRequestStatus.QUOTING },
      });

      await tx.outboxEvent.create({
        data: {
          tenantId,
          aggregateType: 'Quotation',
          aggregateId: quotation.id,
          eventType: 'QuotationSubmitted',
          payload: { quotationId: quotation.id, serviceRequestId: dto.serviceRequestId },
        },
      });

      return quotation;
    });
  }
}
