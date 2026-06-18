import { Controller, Post, Body, Headers, HttpCode, Logger, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Public } from '../../common/decorators/auth.decorators';
import { PrismaService } from '../../database/prisma.service';
import { PaymentProcessorService } from '../payments/payment-processor.service';
import { createHash, createHmac } from 'crypto';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  private readonly mpWebhookSecret: string | undefined;

  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentProcessor: PaymentProcessorService,
    private readonly config: ConfigService,
  ) {
    this.mpWebhookSecret = this.config.get<string>('app.mpWebhookSecret');
  }

  private verifyMpSignature(
    body: Record<string, unknown>,
    signature?: string,
    requestId?: string,
  ): void {
    if (!this.mpWebhookSecret || !signature) return; // si no hay secret configurado, no validar

    // Formato MP: "ts=<timestamp>,v1=<hash>"
    const parts = Object.fromEntries(
      signature.split(',').map((p) => p.split('=')),
    );
    const ts = parts['ts'];
    const v1 = parts['v1'];
    if (!ts || !v1) {
      this.logger.warn('Webhook MP: firma malformada');
      throw new ForbiddenException('Firma inválida');
    }

    const dataId = String((body.data as Record<string, unknown>)?.id ?? body.id ?? '');
    const manifest = `id:${dataId};request-id:${requestId ?? ''};ts:${ts};`;
    const expected = createHmac('sha256', this.mpWebhookSecret).update(manifest).digest('hex');

    if (expected !== v1) {
      this.logger.warn('Webhook MP: firma no coincide');
      throw new ForbiddenException('Firma inválida');
    }
  }

  @Public()
  @Post('mercadopago')
  @HttpCode(200)
  @ApiOperation({ summary: 'Webhook Mercado Pago (idempotente)' })
  async mercadoPago(
    @Body() body: Record<string, unknown>,
    @Headers('x-signature') signature?: string,
    @Headers('x-request-id') requestId?: string,
  ) {
    this.verifyMpSignature(body, signature, requestId);

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
