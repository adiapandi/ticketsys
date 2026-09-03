import {
  Controller,
  Get,
  Post,
  Param,
  Patch,
  Delete,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { bulkImportMulterConfig } from './bulk-import.multer.config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateUserDto, @CurrentUser() user: any) {
    return this.usersService.create(dto, user.userId);
  }

  @Post('bulk-import')
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('file', bulkImportMulterConfig))
  bulkImport(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: any) {
    return this.usersService.bulkImport(file.buffer, user.userId);
  }

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
  updateRole(
    @Param('id') id: string,
    @Body('role') role: 'ADMIN' | 'AGENT' | 'CUSTOMER',
    @CurrentUser() user: any,
  ) {
    return this.usersService.updateRole(id, role, user.userId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.usersService.remove(id, user.userId);
  }
}
