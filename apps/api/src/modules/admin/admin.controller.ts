import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MemberRole } from '@fixya/database';
import { CurrentUser, Roles } from '../../common/decorators/auth.decorators';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { AdminService } from './admin.service';
import { AdminFinanceService } from './admin-finance.service';
import {
  AdminFinancePaginationDto,
  UpdateCommissionRuleDto,
} from './dto/admin-finance.dto';

const FINANCE_READ_ROLES = [
  MemberRole.SUPER_ADMIN,
  MemberRole.CONTADOR,
  MemberRole.SUPERVISOR,
] as const;

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly adminFinanceService: AdminFinanceService,
  ) {}

  @Get('professionals/pending')
  @Roles(MemberRole.SUPER_ADMIN, MemberRole.SUPERVISOR, MemberRole.OPERADOR)
  @ApiOperation({ summary: 'Profesionales pendientes de aprobación' })
  listPending() {
    return this.adminService.listPendingProfessionals();
  }

  @Post('professionals/:id/approve')
  @Roles(MemberRole.SUPER_ADMIN, MemberRole.SUPERVISOR, MemberRole.OPERADOR)
  @ApiOperation({ summary: 'Aprobar profesional y publicar servicios' })
  approve(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.adminService.approveProfessional(id, user.sub);
  }

  @Post('professionals/:id/reject')
  @Roles(MemberRole.SUPER_ADMIN, MemberRole.SUPERVISOR, MemberRole.OPERADOR)
  @ApiOperation({ summary: 'Rechazar solicitud de profesional' })
  reject(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: { note?: string },
  ) {
    return this.adminService.rejectProfessional(id, user.sub, body.note);
  }

  @Get('finance/summary')
  @Roles(...FINANCE_READ_ROLES)
  @ApiOperation({ summary: 'Resumen financiero de la plataforma' })
  financeSummary() {
    return this.adminFinanceService.getSummary();
  }

  @Get('finance/wallets')
  @Roles(...FINANCE_READ_ROLES)
  @ApiOperation({ summary: 'Cuentas wallet de todas las contrataciones' })
  financeWallets(@Query() query: AdminFinancePaginationDto) {
    return this.adminFinanceService.listWalletAccounts(query.page ?? 1, query.limit ?? 20);
  }

  @Get('finance/payments')
  @Roles(...FINANCE_READ_ROLES)
  @ApiOperation({ summary: 'Pagos Mercado Pago de la plataforma' })
  financePayments(@Query() query: AdminFinancePaginationDto) {
    return this.adminFinanceService.listPayments(query.page ?? 1, query.limit ?? 20);
  }

  @Get('finance/ledger')
  @Roles(...FINANCE_READ_ROLES)
  @ApiOperation({ summary: 'Libro diario global' })
  financeLedger(@Query() query: AdminFinancePaginationDto) {
    return this.adminFinanceService.listLedger(query.page ?? 1, query.limit ?? 20);
  }

  @Patch('finance/commission-rules/:id')
  @Roles(MemberRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Actualizar tasa de comisión' })
  updateCommissionRule(@Param('id') id: string, @Body() body: UpdateCommissionRuleDto) {
    return this.adminFinanceService.updateCommissionRule(id, body.ratePercent);
  }
}
