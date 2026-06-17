import { Controller, Get, Post, Param, ParseUUIDPipe } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MemberRole } from '@fixya/database';
import {
  AcceptQuotationCommand,
  GetEngagementExpedienteQuery,
} from './engagement.handlers';
import { CurrentUser, Roles } from '../../common/decorators/auth.decorators';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('Engagements')
@ApiBearerAuth()
@Controller('engagements')
export class EngagementController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('accept-quotation/:quotationId')
  @Roles(MemberRole.CLIENTE)
  @ApiOperation({ summary: 'Aceptar presupuesto e iniciar contratación' })
  acceptQuotation(
    @Param('quotationId', ParseUUIDPipe) quotationId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.commandBus.execute(
      new AcceptQuotationCommand(quotationId, user.sub),
    );
  }

  @Get(':id/expediente')
  @ApiOperation({ summary: 'Expediente digital único de la contratación' })
  getExpediente(@Param('id', ParseUUIDPipe) id: string) {
    return this.queryBus.execute(new GetEngagementExpedienteQuery(id));
  }
}
