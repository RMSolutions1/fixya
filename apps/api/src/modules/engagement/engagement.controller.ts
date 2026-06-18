import { Controller, Get, Post, Body, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MemberRole } from '@fixya/database';
import {
  AcceptQuotationCommand,
  GetEngagementExpedienteQuery,
  StartEngagementCommand,
  CompleteEngagementCommand,
  OpenDisputeCommand,
  ListEngagementsQuery,
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

  @Get()
  @ApiOperation({ summary: 'Mis contrataciones (cliente o profesional)' })
  list(@CurrentUser() user: JwtPayload) {
    return this.queryBus.execute(
      new ListEngagementsQuery(user.sub, (user.roles ?? []) as MemberRole[]),
    );
  }

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

  @Post(':id/start')
  @Roles(MemberRole.PROFESIONAL, MemberRole.EMPRESA)
  @ApiOperation({ summary: 'Profesional inicia el trabajo (FUNDS_HELD → IN_PROGRESS)' })
  startWork(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.commandBus.execute(new StartEngagementCommand(id, user.sub));
  }

  @Post(':id/complete')
  @Roles(MemberRole.PROFESIONAL, MemberRole.EMPRESA)
  @ApiOperation({ summary: 'Profesional marca el trabajo como terminado (→ PENDING_APPROVAL)' })
  completeWork(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Body('note') note?: string,
  ) {
    return this.commandBus.execute(new CompleteEngagementCommand(id, user.sub, note));
  }

  @Post(':id/dispute')
  @Roles(MemberRole.CLIENTE)
  @ApiOperation({ summary: 'Cliente abre disputa' })
  openDispute(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Body('reason') reason: string,
  ) {
    return this.commandBus.execute(new OpenDisputeCommand(id, user.sub, reason));
  }

  @Get(':id/expediente')
  @ApiOperation({ summary: 'Expediente digital completo' })
  getExpediente(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('pollPayment') pollPayment?: string,
  ) {
    return this.queryBus.execute(new GetEngagementExpedienteQuery(id));
  }
}
