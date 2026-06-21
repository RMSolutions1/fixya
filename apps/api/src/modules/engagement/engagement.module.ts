import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EngagementController } from './engagement.controller';
import { EmailModule } from '../../common/email/email.module';
import {
  AcceptQuotationHandler,
  GetEngagementExpedienteHandler,
  StartEngagementHandler,
  CompleteEngagementHandler,
  OpenDisputeHandler,
  ListEngagementsHandler,
} from './engagement.handlers';

@Module({
  imports: [CqrsModule, EmailModule],
  controllers: [EngagementController],
  providers: [
    AcceptQuotationHandler,
    GetEngagementExpedienteHandler,
    StartEngagementHandler,
    CompleteEngagementHandler,
    OpenDisputeHandler,
    ListEngagementsHandler,
  ],
})
export class EngagementModule {}
