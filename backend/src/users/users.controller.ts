import {
  Controller,
  Get,
  Post,
  Param,
  Patch,
  Delete,
  Body,
  Query,
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
  @Roles('SUPER_ADMIN', 'ADMIN')
  create(@Body() dto: CreateUserDto, @CurrentUser() user: any) {
    return this.usersService.create(dto, user);
  }

  @Post('bulk-import')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @UseInterceptors(FileInterceptor('file', bulkImportMulterConfig))
  bulkImport(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: any) {
    return this.usersService.bulkImport(file.buffer, user);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'AGENT')
  findAll(@CurrentUser() user: any) {
    return this.usersService.findAll(user);
  }

  @Get('agents')
  @Roles('SUPER_ADMIN', 'ADMIN', 'AGENT')
  findAgents(@Query('departmentId') departmentId?: string) {
    return this.usersService.findAgentsAndAdmins(departmentId);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id/role')
  @Roles('SUPER_ADMIN', 'ADMIN')
  updateRole(
    @Param('id') id: string,
    @Body('role') role: 'SUPER_ADMIN' | 'ADMIN' | 'AGENT' | 'CUSTOMER',
    @Body('departmentId') departmentId: string | undefined,
    @CurrentUser() user: any,
  ) {
    return this.usersService.updateRole(id, role, departmentId, user);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.usersService.remove(id, user);
  }
}
