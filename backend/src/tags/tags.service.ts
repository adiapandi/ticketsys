import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.tag.findMany({
      orderBy: { name: 'asc' },
    });
  }

  // Cari tag by nama (case-insensitive), bikin baru kalau belum ada
  async findOrCreate(name: string) {
    const normalized = name.trim().toLowerCase();
    const existing = await this.prisma.tag.findFirst({
      where: { name: { equals: normalized, mode: 'insensitive' } },
    });
    if (existing) return existing;
    return this.prisma.tag.create({ data: { name: normalized } });
  }
}
