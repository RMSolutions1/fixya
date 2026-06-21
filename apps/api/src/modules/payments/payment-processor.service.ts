import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { MercadoPagoService } from './mercadopago.service';
import { EngagementStatus, PaymentStatus } from '@fixya/database';
import { Prisma } from '@fixya/database';

@Injectable()
export class PaymentProcessorService {
  private readonly logger = new Logger(PaymentProcessorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mp: MercadoPagoService,
  ) {}

  async createCheckout(engagementId: string, clientId: string) {
    const engagement = await this.prisma.engagement.findFirst({
      where: { id: engagementId, deletedAt: null },
      include: {
        payment: true,
        client: { select: { email: true } },
        serviceRequest: { select: { title: true } },
      },
    });

    if (!engagement) throw new NotFoundException('Contratación no encontrada');
    if (engagement.clientId !== clientId) throw new ForbiddenException('No autorizado');
    if (engagement.payment?.status === PaymentStatus.APPROVED) {
      throw new BadRequestException('El pago ya fue confirmado');
    }

    const amount = Number(engagement.totalAmount);
    const title = engagement.serviceRequest.title.slice(0, 200);

    let payment = engagement.payment;
    if (!payment) {
      payment = await this.prisma.payment.create({
        data: {
          tenantId: engagement.tenantId,
          engagementId: engagement.id,
          amount: engagement.totalAmount,
          currency: engagement.currency,
          status: PaymentStatus.PENDING,
          externalRef: engagementId,
        },
      });
    } else if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Estado de pago inválido para checkout');
    }

    await this.prisma.engagement.update({
      where: { id: engagementId },
      data: { status: EngagementStatus.PAYMENT_PENDING },
    });

    if (this.mp.isConfigured()) {
      const preference = await this.mp.createPreference({
        engagementId,
        paymentId: payment.id,
        title,
        amount,
        currency: engagement.currency,
        payerEmail: engagement.client.email,
      });

      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          mpPreferenceId: preference.id,
          mpMetadata: preference as unknown as Prisma.InputJsonValue,
        },
      });

      return {
        mode: 'mercadopago' as const,
        paymentId: payment.id,
        preferenceId: preference.id,
        checkoutUrl: this.mp.getCheckoutUrl(preference),
      };
    }

    if (process.env.NODE_ENV === 'production') {
      throw new BadRequestException(
        'Mercado Pago no está configurado. Contacte al administrador de la plataforma.',
      );
    }

    return {
      mode: 'sandbox' as const,
      paymentId: payment.id,
      checkoutUrl: null,
      message: 'Modo sandbox: confirmá el pago desde el expediente (solo desarrollo)',
    };
  }

  async confirmPayment(paymentId: string, mpPaymentId?: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { engagement: true },
    });

    if (!payment) throw new NotFoundException('Pago no encontrado');
    if (payment.status === PaymentStatus.APPROVED) {
      return { status: 'already_approved', paymentId };
    }

    const amount = Number(payment.amount);
    const commissionRule = await this.prisma.commissionRule.findFirst({
      where: { isGlobal: true, isActive: true },
    });
    const rate = Number(commissionRule?.ratePercent ?? 0.08);
    const commission = Math.round(amount * rate * 100) / 100;
    const netHeld = Math.round((amount - commission) * 100) / 100;

    return this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.APPROVED,
          mpPaymentId: mpPaymentId ?? `sandbox-${paymentId.slice(0, 8)}`,
          paidAt: new Date(),
        },
      });

      await tx.engagement.update({
        where: { id: payment.engagementId },
        data: { status: EngagementStatus.FUNDS_HELD },
      });

      const wallet = await tx.walletAccount.upsert({
        where: { engagementId: payment.engagementId },
        create: {
          tenantId: payment.tenantId,
          engagementId: payment.engagementId,
          heldAmount: netHeld,
          commissionAmount: commission,
          currency: payment.currency,
        },
        update: {
          heldAmount: netHeld,
          commissionAmount: commission,
        },
      });

      const entryNumber = `LE-${Date.now()}`;
      const ledgerEntry = await tx.ledgerEntry.create({
        data: {
          tenantId: payment.tenantId,
          walletAccountId: wallet.id,
          entryNumber,
          entryType: 'PAYMENT_RECEIVED',
          description: `Pago recibido — engagement ${payment.engagementId.slice(0, 8)}`,
          referenceType: 'Payment',
          referenceId: paymentId,
          postedAt: new Date(),
          lines: {
            create: [
              {
                accountCode: '1100',
                accountName: 'Fondos retenidos',
                debit: netHeld,
                credit: 0,
              },
              {
                accountCode: '4100',
                accountName: 'Comisión FixYa',
                debit: commission,
                credit: 0,
              },
              {
                accountCode: '2100',
                accountName: 'Pasivo clientes',
                debit: 0,
                credit: amount,
              },
            ],
          },
        },
      });

      await tx.walletEvent.create({
        data: {
          tenantId: payment.tenantId,
          walletAccountId: wallet.id,
          sequence: 1,
          eventType: 'FUNDS_HELD',
          payload: { paymentId, amount, commission, ledgerEntryId: ledgerEntry.id },
        },
      });

      await tx.engagementTimelineEvent.create({
        data: {
          engagementId: payment.engagementId,
          tenantId: payment.tenantId,
          eventType: 'PaymentConfirmed',
          payload: { paymentId, amount, mpPaymentId },
        },
      });

      this.logger.log(`Pago confirmado: ${paymentId} — $${amount} ARS`);
      return { status: 'approved', paymentId, walletAccountId: wallet.id };
    });
  }

  async releaseFunds(engagementId: string, clientId: string) {
    const engagement = await this.prisma.engagement.findFirst({
      where: { id: engagementId, clientId, deletedAt: null },
      include: { walletAccount: true, payment: true },
    });

    if (!engagement) throw new NotFoundException('Contratación no encontrada');
    if (engagement.status !== EngagementStatus.FUNDS_HELD) {
      throw new BadRequestException('Los fondos no están en retención');
    }
    if (!engagement.walletAccount) throw new BadRequestException('Wallet no encontrada');

    const held = Number(engagement.walletAccount.heldAmount);

    return this.prisma.$transaction(async (tx) => {
      await tx.walletAccount.update({
        where: { id: engagement.walletAccount!.id },
        data: {
          heldAmount: 0,
          releasedAmount: { increment: held },
        },
      });

      await tx.engagement.update({
        where: { id: engagementId },
        data: { status: EngagementStatus.FUNDS_RELEASED },
      });

      await tx.ledgerEntry.create({
        data: {
          tenantId: engagement.tenantId,
          walletAccountId: engagement.walletAccount!.id,
          entryNumber: `LE-${Date.now()}-REL`,
          entryType: 'RELEASE',
          description: 'Liberación de fondos al profesional',
          referenceType: 'Engagement',
          referenceId: engagementId,
          postedAt: new Date(),
          lines: {
            create: [
              {
                accountCode: '1100',
                accountName: 'Fondos retenidos',
                debit: 0,
                credit: held,
              },
              {
                accountCode: '1200',
                accountName: 'Fondos liberados',
                debit: held,
                credit: 0,
              },
            ],
          },
        },
      });

      await tx.engagementTimelineEvent.create({
        data: {
          engagementId,
          tenantId: engagement.tenantId,
          eventType: 'FundsReleased',
          actorId: clientId,
          payload: { amount: held },
        },
      });

      return { status: 'released', amount: held };
    });
  }

  /**
   * Devolución / botón de arrepentimiento: reembolsa al cliente mientras los fondos
   * sigan retenidos (no liberados al profesional). Llama a MP si está configurado y
   * registra el reverso contable.
   */
  async refundEngagement(engagementId: string, clientId: string, reason?: string) {
    const engagement = await this.prisma.engagement.findFirst({
      where: { id: engagementId, clientId, deletedAt: null },
      include: { walletAccount: true, payment: true },
    });

    if (!engagement) throw new NotFoundException('Contratación no encontrada');
    if (!engagement.payment || engagement.payment.status !== PaymentStatus.APPROVED) {
      throw new BadRequestException('No hay un pago aprobado para reembolsar');
    }
    if (engagement.status === EngagementStatus.FUNDS_RELEASED) {
      throw new BadRequestException(
        'Los fondos ya fueron liberados al profesional; gestioná el reclamo por disputa',
      );
    }

    const payment = engagement.payment;
    const amount = Number(payment.amount);

    // Reembolso real en Mercado Pago (si hay pago MP y credenciales)
    let mpRefundId: string | null = null;
    if (payment.mpPaymentId && this.mp.isConfigured()) {
      const refund = await this.mp.refundPayment(payment.mpPaymentId, amount);
      if (!refund) {
        throw new BadRequestException('No se pudo procesar la devolución en Mercado Pago');
      }
      mpRefundId = String(refund.id);
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.paymentRefund.create({
        data: {
          paymentId: payment.id,
          mpRefundId,
          amount: payment.amount,
          reason: reason ?? 'Botón de arrepentimiento (Res. 424/2020)',
          processedAt: new Date(),
        },
      });

      await tx.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.REFUNDED, refundedAmount: payment.amount },
      });

      if (engagement.walletAccount) {
        const held = Number(engagement.walletAccount.heldAmount);
        await tx.walletAccount.update({
          where: { id: engagement.walletAccount.id },
          data: { heldAmount: 0 },
        });
        await tx.ledgerEntry.create({
          data: {
            tenantId: engagement.tenantId,
            walletAccountId: engagement.walletAccount.id,
            entryNumber: `LE-${Date.now()}-REF`,
            entryType: 'REFUND',
            description: 'Devolución al cliente (arrepentimiento)',
            referenceType: 'Payment',
            referenceId: payment.id,
            postedAt: new Date(),
            lines: {
              create: [
                { accountCode: '2100', accountName: 'Pasivo clientes', debit: amount, credit: 0 },
                { accountCode: '1100', accountName: 'Fondos retenidos', debit: 0, credit: held },
              ],
            },
          },
        });
      }

      await tx.engagement.update({
        where: { id: engagementId },
        data: { status: EngagementStatus.CANCELLED },
      });

      await tx.engagementTimelineEvent.create({
        data: {
          engagementId,
          tenantId: engagement.tenantId,
          eventType: 'PaymentRefunded',
          actorId: clientId,
          payload: { amount, mpRefundId, reason: reason ?? null },
        },
      });

      this.logger.log(`Devolución procesada: engagement ${engagementId} — $${amount} ARS`);
      return { status: 'refunded', amount, mpRefundId };
    });
  }

  async getPaymentStatus(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      select: {
        id: true,
        status: true,
        amount: true,
        currency: true,
        paidAt: true,
        mpPaymentId: true,
        mpPreferenceId: true,
        engagementId: true,
      },
    });
    if (!payment) throw new NotFoundException('Pago no encontrado');
    return payment;
  }
}
