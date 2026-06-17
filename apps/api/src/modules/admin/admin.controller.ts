import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MemberRole } from '@fixya/database';
import { CurrentUser, Roles } from '../../common/decorators/auth.decorators';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

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
}
