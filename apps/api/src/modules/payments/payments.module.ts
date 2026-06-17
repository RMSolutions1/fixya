import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentProcessorService } from './payment-processor.service';
import { MercadoPagoService } from './mercadopago.service';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentProcessorService, MercadoPagoService],
  exports: [PaymentProcessorService],
})
export class PaymentsModule {}
