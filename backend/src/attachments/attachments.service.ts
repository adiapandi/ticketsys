import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs/promises';
import * as path from 'path';
import { UPLOAD_DIR } from './multer.config';

interface AuthUser {
  userId: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'AGENT' | 'CUSTOMER';
  departmentId?: string | null;
}

@Injectable()
export class AttachmentsService {
  constructor(private prisma: PrismaService) {}

  // Satu tempat validasi akses, dipakai di semua operasi supaya konsisten
  private async assertTicketAccess(ticketId: string, user: AuthUser) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { id: true, departmentId: true, requesterId: true },
    });
    if (!ticket) throw new NotFoundException('Ticket tidak ditemukan');

    if (user.role === 'CUSTOMER') {
      if (ticket.requesterId !== user.userId) {
        throw new ForbiddenException('Kamu tidak punya akses ke ticket ini');
      }
    } else if (user.role !== 'SUPER_ADMIN') {
      if (ticket.departmentId !== user.departmentId) {
        throw new ForbiddenException('Ticket ini bukan dari department kamu');
      }
    }
    return ticket;
  }

  async create(ticketId: string, file: Express.Multer.File, user: AuthUser, commentId?: string) {
    await this.assertTicketAccess(ticketId, user);

    return this.prisma.attachment.create({
      data: {
        filename: file.originalname,
        storedName: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        ticketId,
        commentId,
        uploadedById: user.userId,
      },
    });
  }

  async findByTicket(ticketId: string, user: AuthUser) {
    // Sebelumnya endpoint ini bisa diakses siapa saja yang login tanpa cek kepemilikan ticket sama sekali
    await this.assertTicketAccess(ticketId, user);
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
    if (!attachment.ticket) throw new NotFoundException('Ticket terkait tidak ditemukan');

    if (user.role === 'CUSTOMER') {
      if (attachment.ticket.requesterId !== user.userId) {
        throw new ForbiddenException('Kamu tidak punya akses ke file ini');
      }
    } else if (user.role !== 'SUPER_ADMIN') {
      if (attachment.ticket.departmentId !== user.departmentId) {
        throw new ForbiddenException('Kamu tidak punya akses ke file ini');
      }
    }

    const filePath = path.join(UPLOAD_DIR, attachment.storedName);
    return { filePath, filename: attachment.filename, mimetype: attachment.mimetype };
  }

  async remove(attachmentId: string, user: AuthUser) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: { ticket: true },
    });
    if (!attachment) throw new NotFoundException('File tidak ditemukan');

    if (attachment.ticket && user.role !== 'SUPER_ADMIN' && attachment.ticket.departmentId !== user.departmentId) {
      throw new ForbiddenException('Kamu tidak punya akses untuk menghapus file ini');
    }

    const filePath = path.join(UPLOAD_DIR, attachment.storedName);
    await fs.unlink(filePath).catch(() => {
      // File fisik mungkin sudah tidak ada, tidak masalah — tetap hapus record-nya
    });

    return this.prisma.attachment.delete({ where: { id: attachmentId } });
  }
}
