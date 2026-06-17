import {
  Controller,
  Post,
  Get,
  Param,
  ParseUUIDPipe,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MemberRole } from '@fixya/database';
import { PaymentProcessorService } from './payment-processor.service';
import { CurrentUser, Roles } from '../../common/decorators/auth.decorators';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { ConfigService } from '@nestjs/config';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly processor: PaymentProcessorService,
    private readonly config: ConfigService,
  ) {}

  @Post('engagements/:engagementId/checkout')
  @Roles(MemberRole.CLIENTE)
  @ApiOperation({ summary: 'Iniciar checkout Mercado Pago (o sandbox)' })
  createCheckout(
    @Param('engagementId', ParseUUIDPipe) engagementId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.processor.createCheckout(engagementId, user.sub);
  }

  @Post('engagements/:engagementId/release')
  @Roles(MemberRole.CLIENTE)
  @ApiOperation({ summary: 'Liberar fondos al profesional (conformidad cliente)' })
  releaseFunds(
    @Param('engagementId', ParseUUIDPipe) engagementId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.processor.releaseFunds(engagementId, user.sub);
  }

  @Post('sandbox/:paymentId/confirm')
  @Roles(MemberRole.CLIENTE, MemberRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Confirmar pago sandbox (solo desarrollo)' })
  sandboxConfirm(@Param('paymentId', ParseUUIDPipe) paymentId: string) {
    const nodeEnv = this.config.get<string>('app.nodeEnv', 'development');
    const sandboxEnabled = this.config.get<boolean>('app.enableSandboxPayments', false);
    if (nodeEnv === 'production' || !sandboxEnabled) {
      throw new NotFoundException();
    }
    return this.processor.confirmPayment(paymentId);
  }

  @Get(':paymentId/status')
  @ApiOperation({ summary: 'Estado del pago' })
  async getStatus(@Param('paymentId', ParseUUIDPipe) paymentId: string) {
    return this.processor.getPaymentStatus(paymentId);
  }
}
