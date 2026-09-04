import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as fs from 'fs';
import { AttachmentsService } from './attachments.service';
import { multerConfig } from './multer.config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('tickets/:ticketId/attachments')
export class AttachmentsController {
  constructor(private attachmentsService: AttachmentsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async upload(
    @Param('ticketId') ticketId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    return this.attachmentsService.create(ticketId, file, user);
  }

  @Get()
  findByTicket(@Param('ticketId') ticketId: string, @CurrentUser() user: any) {
    return this.attachmentsService.findByTicket(ticketId, user);
  }
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attachments')
export class AttachmentDownloadController {
  constructor(private attachmentsService: AttachmentsService) {}

  @Get(':id/download')
  async download(@Param('id') id: string, @CurrentUser() user: any, @Res() res: Response) {
    const { filePath, filename, mimetype } = await this.attachmentsService.getFileForDownload(id, user);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File fisik tidak ditemukan di server');
    }
    res.setHeader('Content-Type', mimetype);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    fs.createReadStream(filePath).pipe(res);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'AGENT')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.attachmentsService.remove(id, user);
  }
}
