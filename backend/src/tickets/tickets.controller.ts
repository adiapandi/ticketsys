import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { QueryTicketDto } from './dto/query-ticket.dto';
import { SubmitCsatDto } from './dto/submit-csat.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tickets')
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  @Post()
  create(@Body() dto: CreateTicketDto, @CurrentUser() user: any) {
    return this.ticketsService.create(dto, user);
  }

  @Get()
  findAll(@Query() query: QueryTicketDto, @CurrentUser() user: any) {
    return this.ticketsService.findAll(query, user);
  }

  @Get('stats')
  getStats(@CurrentUser() user: any) {
    return this.ticketsService.getStats(user);
  }

  @Get('csat-stats')
  @Roles('SUPER_ADMIN', 'ADMIN', 'AGENT')
  getCsatStats(@CurrentUser() user: any) {
    return this.ticketsService.getCsatStats(user);
  }

  @Get('export')
  @Roles('SUPER_ADMIN', 'ADMIN', 'AGENT')
  async exportTickets(
    @Query() query: QueryTicketDto,
    @Query('format') format: 'csv' | 'xlsx' = 'xlsx',
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    const buffer = await this.ticketsService.exportTickets(query, format, user);
    const mimetype =
      format === 'csv'
        ? 'text/csv'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const filename = `tickets-export-${new Date().toISOString().slice(0, 10)}.${format}`;

    res.setHeader('Content-Type', mimetype);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.ticketsService.findOne(id, user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTicketDto, @CurrentUser() user: any) {
    return this.ticketsService.update(id, dto, user);
  }

  @Post(':id/csat')
  submitCsat(@Param('id') id: string, @Body() dto: SubmitCsatDto, @CurrentUser() user: any) {
    return this.ticketsService.submitCsat(id, dto, user);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.ticketsService.remove(id, user);
  }
}
