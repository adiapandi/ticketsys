import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audit-logs')
export class AuditLogController {
  constructor(private auditLogService: AuditLogService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'AGENT')
  findAll(@Query('ticketId') ticketId: string | undefined, @CurrentUser() user: any) {
    return this.auditLogService.findAll(ticketId, user);
  }
}
