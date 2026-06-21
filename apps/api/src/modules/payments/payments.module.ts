import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentProcessorService } from './payment-processor.service';
import { MercadoPagoService } from './mercadopago.service';
import { EmailModule } from '../../common/email/email.module';

@Module({
  imports: [EmailModule],
  controllers: [PaymentsController],
  providers: [PaymentProcessorService, MercadoPagoService],
  exports: [PaymentProcessorService],
})
export class PaymentsModule {}
