import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

const APP_NAME = 'FixYa';
const FROM_ADDRESS = 'FixYa <noreply@fixya.emprenor.com>';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend | null;
  private readonly appPublicUrl: string;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('app.resendApiKey');
    this.resend = apiKey ? new Resend(apiKey) : null;
    this.appPublicUrl = this.config.get<string>('app.appPublicUrl', 'https://fixya.emprenor.com');
    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY no configurada — emails desactivados');
    }
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    if (!this.resend) {
      this.logger.debug(`[EMAIL SIMULADO] Para: ${to} | Asunto: ${subject}`);
      return;
    }
    try {
      const { error } = await this.resend.emails.send({ from: FROM_ADDRESS, to, subject, html });
      if (error) this.logger.error(`Error Resend: ${JSON.stringify(error)}`);
    } catch (err) {
      this.logger.error(`Excepción al enviar email a ${to}: ${err}`);
    }
  }

  async sendWelcome(to: string, firstName: string): Promise<void> {
    const subject = `Bienvenido a ${APP_NAME}, ${firstName}`;
    const html = `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1c1917">
        <h1 style="color:#2E2A6E">¡Hola, ${firstName}! 👋</h1>
        <p>Tu cuenta en <strong>${APP_NAME}</strong> ya está activa.</p>
        <p>Podés empezar a buscar profesionales, comparar presupuestos y contratar con pagos seguros vía Mercado Pago.</p>
        <a href="${this.appPublicUrl}/dashboard"
           style="display:inline-block;background:#16a34a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
          Ir a mi dashboard →
        </a>
        <p style="font-size:12px;color:#78716c;margin-top:32px">
          ${APP_NAME} · Grupo Emprenor · RM International Group SAS<br>
          Av. Casiano Casas 3080, Salta, Argentina
        </p>
      </div>`;
    await this.send(to, subject, html);
  }

  async sendPasswordReset(to: string, firstName: string, token: string): Promise<void> {
    const resetUrl = `${this.appPublicUrl}/reset-password?token=${token}`;
    const subject = `Restablecer tu contraseña · ${APP_NAME}`;
    const html = `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1c1917">
        <h1 style="color:#2E2A6E">Restablecé tu contraseña</h1>
        <p>Hola, ${firstName}. Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
        <a href="${resetUrl}"
           style="display:inline-block;background:#16a34a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
          Restablecer contraseña →
        </a>
        <p>Este enlace expira en <strong>1 hora</strong>. Si no solicitaste el cambio, ignorá este email.</p>
        <p style="word-break:break-all;font-size:12px;color:#78716c">
          O copiá este enlace en tu navegador:<br>${resetUrl}
        </p>
        <p style="font-size:12px;color:#78716c;margin-top:32px">
          ${APP_NAME} · Grupo Emprenor · RM International Group SAS
        </p>
      </div>`;
    await this.send(to, subject, html);
  }

  async sendEmailVerification(to: string, firstName: string, token: string): Promise<void> {
    const verifyUrl = `${this.appPublicUrl}/verificar-email?token=${token}`;
    const subject = `Confirmá tu email · ${APP_NAME}`;
    const html = `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1c1917">
        <h1 style="color:#2E2A6E">Confirmá tu email</h1>
        <p>Hola, ${firstName}. Gracias por registrarte en <strong>${APP_NAME}</strong>. Confirmá tu dirección de email para activar todas las funciones de tu cuenta.</p>
        <a href="${verifyUrl}"
           style="display:inline-block;background:#16a34a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
          Confirmar mi email →
        </a>
        <p>Este enlace expira en <strong>24 horas</strong>. Si no creaste esta cuenta, ignorá este email.</p>
        <p style="word-break:break-all;font-size:12px;color:#78716c">
          O copiá este enlace en tu navegador:<br>${verifyUrl}
        </p>
        <p style="font-size:12px;color:#78716c;margin-top:32px">
          ${APP_NAME} · Grupo Emprenor · RM International Group SAS
        </p>
      </div>`;
    await this.send(to, subject, html);
  }

  async sendProfessionalApproved(to: string, firstName: string): Promise<void> {
    const subject = `¡Tu perfil profesional fue aprobado! · ${APP_NAME}`;
    const html = `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1c1917">
        <h1 style="color:#2E2A6E">¡Felicitaciones, ${firstName}! 🎉</h1>
        <p>Tu perfil como profesional verificado en <strong>${APP_NAME}</strong> fue aprobado. Ya aparecés en el mapa y podés recibir y enviar presupuestos.</p>
        <a href="${this.appPublicUrl}/dashboard"
           style="display:inline-block;background:#16a34a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
          Ver mi perfil →
        </a>
        <p style="font-size:12px;color:#78716c;margin-top:32px">
          ${APP_NAME} · Grupo Emprenor · RM International Group SAS
        </p>
      </div>`;
    await this.send(to, subject, html);
  }

  async sendEngagementCreated(
    to: string,
    firstName: string,
    role: 'client' | 'professional',
    engagementId: string,
    title: string,
    amount: number,
  ): Promise<void> {
    const expedienteUrl = `${this.appPublicUrl}/engagements/${engagementId}`;
    const isClient = role === 'client';
    const formatted = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
    const subject = isClient
      ? `Contratación confirmada · ${APP_NAME}`
      : `Nueva contratación · ${APP_NAME}`;
    const html = `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1c1917">
        <h1 style="color:#2E2A6E">${isClient ? 'Contratación confirmada' : 'Nueva contratación'}</h1>
        <p>Hola, ${firstName}.</p>
        <p><strong>${title}</strong> — ${formatted}</p>
        <p>${isClient ? 'Iniciá el pago desde el expediente para retener los fondos con garantía FixYa.' : 'El cliente debe confirmar el pago. Te avisamos cuando los fondos queden retenidos.'}</p>
        <a href="${expedienteUrl}"
           style="display:inline-block;background:#16a34a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
          Ver expediente →
        </a>
        <p style="font-size:12px;color:#78716c;margin-top:32px">${APP_NAME} · Grupo Emprenor</p>
      </div>`;
    await this.send(to, subject, html);
  }

  async sendPaymentConfirmed(
    to: string,
    firstName: string,
    engagementId: string,
    amount: number,
  ): Promise<void> {
    const url = `${this.appPublicUrl}/engagements/${engagementId}`;
    const formatted = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
    const subject = `Pago confirmado · ${APP_NAME}`;
    const html = `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1c1917">
        <h1 style="color:#2E2A6E">Pago recibido</h1>
        <p>Hola, ${firstName}. Confirmamos el pago de <strong>${formatted}</strong>.</p>
        <p>Los fondos quedan retenidos con garantía FixYa hasta que confirmes la conformidad del trabajo.</p>
        <a href="${url}"
           style="display:inline-block;background:#16a34a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
          Ver expediente →
        </a>
        <p style="font-size:12px;color:#78716c;margin-top:32px">${APP_NAME} · Grupo Emprenor</p>
      </div>`;
    await this.send(to, subject, html);
  }

  async sendFundsReleased(
    to: string,
    firstName: string,
    engagementId: string,
    amount: number,
  ): Promise<void> {
    const url = `${this.appPublicUrl}/engagements/${engagementId}`;
    const formatted = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
    const subject = `Fondos liberados · ${APP_NAME}`;
    const html = `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1c1917">
        <h1 style="color:#2E2A6E">Fondos liberados</h1>
        <p>Hola, ${firstName}. Se liberaron <strong>${formatted}</strong> a tu favor tras la conformidad del cliente.</p>
        <a href="${url}"
           style="display:inline-block;background:#16a34a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
          Ver expediente →
        </a>
        <p style="font-size:12px;color:#78716c;margin-top:32px">${APP_NAME} · Grupo Emprenor</p>
      </div>`;
    await this.send(to, subject, html);
  }

  async sendProfessionalRejected(to: string, firstName: string, note?: string): Promise<void> {
    const subject = `Revisión de documentación pendiente · ${APP_NAME}`;
    const html = `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1c1917">
        <h1 style="color:#2E2A6E">Revisión de documentación</h1>
        <p>Hola, ${firstName}. Revisamos tu documentación y encontramos un inconveniente:</p>
        ${note ? `<blockquote style="border-left:3px solid #e5e7eb;padding-left:12px;color:#78716c">${note}</blockquote>` : ''}
        <p>Podés actualizar tu documentación desde tu dashboard e iniciar una nueva revisión.</p>
        <a href="${this.appPublicUrl}/dashboard/documentacion"
           style="display:inline-block;background:#2E2A6E;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
          Actualizar documentación →
        </a>
        <p style="font-size:12px;color:#78716c;margin-top:32px">
          ${APP_NAME} · Grupo Emprenor · RM International Group SAS
        </p>
      </div>`;
    await this.send(to, subject, html);
  }
}
