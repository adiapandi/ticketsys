import { Module } from '@nestjs/common';
import { AttachmentsService } from './attachments.service';
import {
  AttachmentsController,
  AttachmentDownloadController,
} from './attachments.controller';

@Module({
  controllers: [AttachmentsController, AttachmentDownloadController],
  providers: [AttachmentsService],
})
export class AttachmentsModule {}
