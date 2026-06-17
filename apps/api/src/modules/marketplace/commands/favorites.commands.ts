import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

export class ToggleFavoriteCommand {
  constructor(
    public readonly userId: string,
    public readonly serviceId: string,
  ) {}
}

@CommandHandler(ToggleFavoriteCommand)
export class ToggleFavoriteHandler implements ICommandHandler<ToggleFavoriteCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: ToggleFavoriteCommand) {
    const { userId, serviceId } = command;

    const service = await this.prisma.service.findFirst({
      where: { id: serviceId, deletedAt: null },
    });
    if (!service) throw new NotFoundException('Servicio no encontrado');

    const existing = await this.prisma.favorite.findUnique({
      where: { userId_serviceId: { userId, serviceId } },
    });

    if (existing) {
      await this.prisma.favorite.delete({ where: { id: existing.id } });
      return { favorited: false, serviceId };
    }

    try {
      await this.prisma.favorite.create({
        data: { userId, serviceId, tenantId: service.tenantId },
      });
      return { favorited: true, serviceId };
    } catch {
      throw new ConflictException('No se pudo agregar a favoritos');
    }
  }
}
