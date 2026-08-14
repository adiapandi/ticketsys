import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs/promises';
import * as path from 'path';
import { UPLOAD_DIR } from './multer.config';

interface AuthUser {
  userId: string;
  role: 'ADMIN' | 'AGENT' | 'CUSTOMER';
}

@Injectable()
export class AttachmentsService {
  constructor(private prisma: PrismaService) {}

  async create(
    ticketId: string,
    file: Express.Multer.File,
    uploadedById: string,
    commentId?: string,
  ) {
    return this.prisma.attachment.create({
      data: {
        filename: file.originalname,
        storedName: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        ticketId,
        commentId,
        uploadedById,
      },
    });
  }

  async findByTicket(ticketId: string) {
    return this.prisma.attachment.findMany({
      where: { ticketId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFileForDownload(attachmentId: string, user: AuthUser) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: { ticket: true },
    });
    if (!attachment) throw new NotFoundException('File tidak ditemukan');

    // Customer hanya boleh download attachment dari ticket miliknya sendiri
    if (user.role === 'CUSTOMER' && attachment.ticket?.requesterId !== user.userId) {
      throw new ForbiddenException('Kamu tidak punya akses ke file ini');
    }

    const filePath = path.join(UPLOAD_DIR, attachment.storedName);
    return { filePath, filename: attachment.filename, mimetype: attachment.mimetype };
  }

  async remove(attachmentId: string) {
    const attachment = await this.prisma.attachment.findUnique({ where: { id: attachmentId } });
    if (!attachment) throw new NotFoundException('File tidak ditemukan');

    const filePath = path.join(UPLOAD_DIR, attachment.storedName);
    await fs.unlink(filePath).catch(() => {
      // File fisik mungkin sudah tidak ada, tidak masalah — tetap hapus record-nya
    });

    return this.prisma.attachment.delete({ where: { id: attachmentId } });
  }
}
