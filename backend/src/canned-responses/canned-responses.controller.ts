import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { CannedResponsesService } from './canned-responses.service';
import { CannedResponseDto } from './dto/canned-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN', 'AGENT')
@Controller('canned-responses')
export class CannedResponsesController {
  constructor(private cannedResponsesService: CannedResponsesService) {}

  @Get()
  findAll() {
    return this.cannedResponsesService.findAll();
  }

  @Post()
  create(@Body() dto: CannedResponseDto, @CurrentUser() user: any) {
    return this.cannedResponsesService.create(dto, user.userId, user.email);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: CannedResponseDto) {
    return this.cannedResponsesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cannedResponsesService.remove(id);
  }
}
