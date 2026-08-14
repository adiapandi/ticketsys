import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.category.findMany({
      include: { _count: { select: { tickets: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async create(dto: CreateCategoryDto) {
    const existing = await this.prisma.category.findUnique({ where: { name: dto.name } });
    if (existing) throw new ConflictException('Kategori dengan nama ini sudah ada');
    return this.prisma.category.create({ data: { name: dto.name } });
  }

  async update(id: string, dto: CreateCategoryDto) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Kategori tidak ditemukan');

    const existing = await this.prisma.category.findUnique({ where: { name: dto.name } });
    if (existing && existing.id !== id) {
      throw new ConflictException('Kategori dengan nama ini sudah ada');
    }

    return this.prisma.category.update({ where: { id }, data: { name: dto.name } });
  }

  async remove(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Kategori tidak ditemukan');

    // Ticket yang pakai kategori ini akan otomatis jadi tanpa kategori (categoryId null)
    await this.prisma.ticket.updateMany({ where: { categoryId: id }, data: { categoryId: null } });
    return this.prisma.category.delete({ where: { id } });
  }
}
