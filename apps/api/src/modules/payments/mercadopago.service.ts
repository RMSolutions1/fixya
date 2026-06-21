import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface MpPreferenceItem {
  id?: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id: string;
}

export interface MpPreferenceResult {
  id: string;
  init_point: string;
  sandbox_init_point: string;
}

@Injectable()
export class MercadoPagoService {
  private readonly logger = new Logger(MercadoPagoService.name);
  private readonly accessToken: string | undefined;
  private readonly isSandbox: boolean;

  constructor(private readonly config: ConfigService) {
    this.accessToken = this.config.get<string>('MP_ACCESS_TOKEN');
    const isProduction = this.config.get<string>('app.nodeEnv') === 'production';
    this.isSandbox = isProduction
      ? false
      : this.config.get<string>('MP_SANDBOX', 'true') === 'true';
  }

  isConfigured(): boolean {
    return !!this.accessToken;
  }

  async createPreference(params: {
    engagementId: string;
    paymentId: string;
    title: string;
    amount: number;
    currency: string;
    payerEmail: string;
  }): Promise<MpPreferenceResult> {
    if (!this.accessToken) {
      throw new Error('MP_ACCESS_TOKEN not configured');
    }

    const baseUrl = this.config.get<string>('APP_PUBLIC_URL', 'http://localhost:3000');
    const apiUrl = this.config.get<string>('API_PUBLIC_URL', 'http://localhost:4000');

    // API_PUBLIC_URL puede venir con o sin el prefijo /api/v1 — evitar duplicarlo.
    const apiBase = apiUrl.replace(/\/+$/, '');
    const notificationUrl = /\/api\/v\d+$/.test(apiBase)
      ? `${apiBase}/webhooks/mercadopago`
      : `${apiBase}/api/v1/webhooks/mercadopago`;

    const body = {
      items: [
        {
          id: params.paymentId,
          title: params.title,
          quantity: 1,
          unit_price: params.amount,
          currency_id: params.currency,
        } satisfies MpPreferenceItem,
      ],
      payer: { email: params.payerEmail },
      external_reference: params.engagementId,
      notification_url: notificationUrl,
      back_urls: {
        success: `${baseUrl}/engagements/${params.engagementId}?payment=success`,
        failure: `${baseUrl}/engagements/${params.engagementId}?payment=failure`,
        pending: `${baseUrl}/engagements/${params.engagementId}?payment=pending`,
      },
      auto_return: 'approved',
      metadata: { engagement_id: params.engagementId, payment_id: params.paymentId },
    };

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.text();
      this.logger.error(`MP preference error: ${err}`);
      throw new Error('Error al crear preferencia de Mercado Pago');
    }

    return response.json() as Promise<MpPreferenceResult>;
  }

  getCheckoutUrl(preference: MpPreferenceResult): string {
    return this.isSandbox ? preference.sandbox_init_point : preference.init_point;
  }

  /** Devolución total o parcial vía API de Mercado Pago. */
  async refundPayment(
    mpPaymentId: string,
    amount?: number,
  ): Promise<{ id: number; status: string } | null> {
    if (!this.accessToken) return null;
    try {
      const res = await fetch(
        `https://api.mercadopago.com/v1/payments/${mpPaymentId}/refunds`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
            'X-Idempotency-Key': `refund-${mpPaymentId}-${amount ?? 'full'}`,
          },
          body: JSON.stringify(amount ? { amount } : {}),
        },
      );
      if (!res.ok) {
        const err = await res.text();
        this.logger.error(`MP refund error: ${err}`);
        return null;
      }
      return res.json() as Promise<{ id: number; status: string }>;
    } catch (err) {
      this.logger.error(`Excepción al reembolsar MP ${mpPaymentId}: ${err}`);
      return null;
    }
  }

  async getPaymentStatus(mpPaymentId: string): Promise<{
    id: number;
    status: string;
    status_detail: string;
    external_reference: string;
    transaction_amount: number;
    currency_id: string;
  } | null> {
    if (!this.accessToken) return null;
    try {
      const res = await fetch(`https://api.mercadopago.com/v1/payments/${mpPaymentId}`, {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      });
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  }
}
