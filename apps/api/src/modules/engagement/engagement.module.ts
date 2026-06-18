import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EngagementController } from './engagement.controller';
import {
  AcceptQuotationHandler,
  GetEngagementExpedienteHandler,
  StartEngagementHandler,
  CompleteEngagementHandler,
  OpenDisputeHandler,
  ListEngagementsHandler,
} from './engagement.handlers';

@Module({
  imports: [CqrsModule],
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
