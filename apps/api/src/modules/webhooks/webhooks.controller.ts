import { Controller, Post, Body, Headers, HttpCode, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/auth.decorators';
import { PrismaService } from '../../database/prisma.service';
import { PaymentProcessorService } from '../payments/payment-processor.service';
import { createHash } from 'crypto';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentProcessor: PaymentProcessorService,
  ) {}

  @Public()
  @Post('mercadopago')
  @HttpCode(200)
  @ApiOperation({ summary: 'Webhook Mercado Pago (idempotente)' })
  async mercadoPago(
    @Body() body: Record<string, unknown>,
    @Headers('x-signature') signature?: string,
    @Headers('x-request-id') requestId?: string,
  ) {
    const paymentId = String(
      (body.data as Record<string, unknown>)?.id ?? body.id ?? 'unknown',
    );
    const action = String(body.action ?? body.type ?? 'unknown');
    const idempotencyKey = createHash('sha256')
      .update(`${paymentId}:${action}:${requestId ?? ''}`)
      .digest('hex');

    const existing = await this.prisma.mpWebhookLog.findUnique({
      where: { idempotencyKey },
    });

    if (existing) {
      this.logger.debug(`Webhook duplicado ignorado: ${idempotencyKey}`);
      return { status: 'already_processed' };
    }

    const log = await this.prisma.mpWebhookLog.create({
      data: {
        mpPaymentId: paymentId,
        eventType: action,
        payload: body as object,
        signature,
        idempotencyKey,
        processed: false,
      },
    });

    if (action.includes('payment') && paymentId !== 'unknown') {
      try {
        const internalPayment = await this.prisma.payment.findFirst({
          where: {
            OR: [{ mpPaymentId: paymentId }, { mpPreferenceId: paymentId }],
          },
        });

        if (internalPayment && action.includes('approved')) {
          await this.paymentProcessor.confirmPayment(internalPayment.id, paymentId);
          await this.prisma.mpWebhookLog.update({
            where: { id: log.id },
            data: { processed: true, processedAt: new Date(), paymentId: internalPayment.id },
          });
        }
      } catch (err) {
        this.logger.error(`Error procesando webhook MP: ${err}`);
      }
    }

    this.logger.log(`Webhook MP recibido: ${action} payment=${paymentId}`);
    return { status: 'received' };
  }
}
