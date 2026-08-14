import { Controller, Get, Param, Patch, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles('ADMIN', 'AGENT')
  findAll() {
    return this.usersService.findAll();
  }

  @Get('agents')
  @Roles('ADMIN', 'AGENT')
  findAgents() {
    return this.usersService.findAgentsAndAdmins();
  }

  @Get(':id')
  @Roles('ADMIN')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id/role')
  @Roles('ADMIN')
  updateRole(@Param('id') id: string, @Body('role') role: 'ADMIN' | 'AGENT' | 'CUSTOMER') {
    return this.usersService.updateRole(id, role);
  }
}
