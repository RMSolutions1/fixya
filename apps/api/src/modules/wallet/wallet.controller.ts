import { Controller, Get, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MemberRole } from '@fixya/database';
import { GetWalletBalanceQuery, GetLedgerQuery } from './wallet.handlers';
import { CurrentUser, Roles } from '../../common/decorators/auth.decorators';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('Wallet')
@ApiBearerAuth()
@Controller('wallet')
export class WalletController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('balance')
  @Roles(
    MemberRole.EMPRESA,
    MemberRole.PROFESIONAL,
    MemberRole.CLIENTE,
    MemberRole.CONTADOR,
    MemberRole.SUPERVISOR,
    MemberRole.OPERADOR,
    MemberRole.AUDITOR,
  )
  @ApiOperation({ summary: 'Resumen de saldos wallet del tenant' })
  getBalance(@CurrentUser() user: JwtPayload) {
    return this.queryBus.execute(new GetWalletBalanceQuery(user.tenantId));
  }

  @Get('balance/:engagementId')
  @ApiOperation({ summary: 'Saldo wallet de una contratación' })
  getEngagementBalance(
    @CurrentUser() user: JwtPayload,
    @Param('engagementId', ParseUUIDPipe) engagementId: string,
  ) {
    return this.queryBus.execute(new GetWalletBalanceQuery(user.tenantId, engagementId));
  }

  @Get('ledger')
  @Roles(
    MemberRole.CONTADOR,
    MemberRole.EMPRESA,
    MemberRole.PROFESIONAL,
    MemberRole.CLIENTE,
    MemberRole.SUPERVISOR,
    MemberRole.OPERADOR,
    MemberRole.AUDITOR,
  )
  @ApiOperation({ summary: 'Libro diario del tenant' })
  getLedger(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.queryBus.execute(
      new GetLedgerQuery(user.tenantId, page ?? 1, limit ?? 50),
    );
  }
}
