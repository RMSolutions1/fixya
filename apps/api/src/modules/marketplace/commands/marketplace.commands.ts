import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ServiceRequestStatus } from '@fixya/database';
import { PrismaService } from '../../../database/prisma.service';
import { TenantContext } from '../../../common/context/tenant.context';
import { CreateServiceRequestDto } from '../dto/marketplace.dto';

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
          address: dto.address,
          city: dto.city,
          province: dto.province,
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
