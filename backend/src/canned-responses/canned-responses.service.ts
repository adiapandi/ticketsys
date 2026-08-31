import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CannedResponseDto } from './dto/canned-response.dto';

@Injectable()
export class CannedResponsesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.cannedResponse.findMany({
      orderBy: { title: 'asc' },
    });
  }

  create(dto: CannedResponseDto, userId: string, userName: string) {
    return this.prisma.cannedResponse.create({
      data: {
        title: dto.title,
        body: dto.body,
        createdById: userId,
        createdByName: userName,
      },
    });
  }

  async update(id: string, dto: CannedResponseDto) {
    const existing = await this.prisma.cannedResponse.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Template tidak ditemukan');
    return this.prisma.cannedResponse.update({
      where: { id },
      data: { title: dto.title, body: dto.body },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.cannedResponse.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Template tidak ditemukan');
    return this.prisma.cannedResponse.delete({ where: { id } });
  }
}
