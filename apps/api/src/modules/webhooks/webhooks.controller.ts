import { Controller, Post, Body, Headers, HttpCode, Logger, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Public } from '../../common/decorators/auth.decorators';
import { PrismaService } from '../../database/prisma.service';
import { PaymentProcessorService } from '../payments/payment-processor.service';
import { createHash, createHmac } from 'crypto';

interface MpPaymentResponse {
  id: number;
  status: string;
  external_reference: string;
  metadata?: { engagement_id?: string; payment_id?: string };
}

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);
  private readonly mpWebhookSecret: string | undefined;
  private readonly mpAccessToken: string | undefined;

  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentProcessor: PaymentProcessorService,
    private readonly config: ConfigService,
  ) {
    this.mpWebhookSecret = this.config.get<string>('app.mpWebhookSecret');
    this.mpAccessToken = this.config.get<string>('MP_ACCESS_TOKEN');
  }

  // ── Verificación de firma HMAC (Mercado Pago) ────────────────────────────

  private verifyMpSignature(
    body: Record<string, unknown>,
    signature?: string,
    requestId?: string,
  ): void {
    if (!this.mpWebhookSecret || !signature) return;

    // Formato MP: "ts=<timestamp>,v1=<hash>"
    const parts = Object.fromEntries(signature.split(',').map((p) => p.split('=')));
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

  // ── Consultar detalles del pago en la API de MP ──────────────────────────

  private async fetchMpPayment(mpPaymentId: string): Promise<MpPaymentResponse | null> {
    if (!this.mpAccessToken) return null;
    try {
      const res = await fetch(`https://api.mercadopago.com/v1/payments/${mpPaymentId}`, {
        headers: { Authorization: `Bearer ${this.mpAccessToken}` },
      });
      if (!res.ok) return null;
      return res.json() as Promise<MpPaymentResponse>;
    } catch {
      return null;
    }
  }

  // ── Endpoint principal ───────────────────────────────────────────────────

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

    const mpPaymentId = String(
      (body.data as Record<string, unknown>)?.id ?? body.id ?? 'unknown',
    );
    const action = String(body.action ?? body.type ?? 'unknown');

    // Idempotencia: evitar procesar el mismo evento dos veces
    const idempotencyKey = createHash('sha256')
      .update(`${mpPaymentId}:${action}:${requestId ?? ''}`)
      .digest('hex');

    const existing = await this.prisma.mpWebhookLog.findUnique({ where: { idempotencyKey } });
    if (existing) {
      this.logger.debug(`Webhook duplicado ignorado: ${idempotencyKey}`);
      return { status: 'already_processed' };
    }

    const log = await this.prisma.mpWebhookLog.create({
      data: {
        mpPaymentId,
        eventType: action,
        payload: body as object,
        signature,
        idempotencyKey,
        processed: false,
      },
    });

    // Solo procesar eventos de pago aprobado
    if (!action.includes('payment') || mpPaymentId === 'unknown') {
      this.logger.log(`Webhook MP recibido (ignorado): ${action} id=${mpPaymentId}`);
      return { status: 'received' };
    }

    try {
      // 1. Consultar la API de MP para obtener external_reference (= engagementId)
      const mpPayment = await this.fetchMpPayment(mpPaymentId);

      if (!mpPayment) {
        this.logger.warn(`No se pudo obtener datos del pago MP ${mpPaymentId}`);
        return { status: 'received' };
      }

      const isApproved = mpPayment.status === 'approved';
      if (!isApproved) {
        this.logger.log(`Webhook MP: pago ${mpPaymentId} con estado ${mpPayment.status} — no procesado`);
        return { status: 'received' };
      }

      // 2. Encontrar el pago interno por external_reference (= engagementId) o metadata
      const engagementId =
        mpPayment.external_reference ||
        mpPayment.metadata?.engagement_id;

      const internalPaymentId = mpPayment.metadata?.payment_id;

      let internalPayment = internalPaymentId
        ? await this.prisma.payment.findUnique({ where: { id: internalPaymentId } })
        : null;

      if (!internalPayment && engagementId) {
        internalPayment = await this.prisma.payment.findFirst({
          where: { engagementId },
        });
      }

      if (!internalPayment) {
        // Fallback: buscar por mpPaymentId o mpPreferenceId directamente
        internalPayment = await this.prisma.payment.findFirst({
          where: {
            OR: [
              { mpPaymentId },
              { mpPreferenceId: mpPaymentId },
            ],
          },
        });
      }

      if (!internalPayment) {
        this.logger.warn(`Webhook MP: pago interno no encontrado para MP payment ${mpPaymentId}`);
        return { status: 'received' };
      }

      // 3. Confirmar el pago (idempotente internamente)
      await this.paymentProcessor.confirmPayment(internalPayment.id, mpPaymentId);

      await this.prisma.mpWebhookLog.update({
        where: { id: log.id },
        data: { processed: true, processedAt: new Date(), paymentId: internalPayment.id },
      });

      this.logger.log(
        `Webhook MP procesado: pago ${internalPayment.id} aprobado (MP ${mpPaymentId})`,
      );
    } catch (err) {
      this.logger.error(`Error procesando webhook MP: ${err}`);
    }

    return { status: 'received' };
  }
}
