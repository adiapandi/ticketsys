import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DepartmentDto } from './dto/department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.department.findMany({
      include: {
        _count: { select: { users: true, tickets: true, categories: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async create(dto: DepartmentDto) {
    const existing = await this.prisma.department.findUnique({ where: { name: dto.name } });
    if (existing) throw new ConflictException('Department dengan nama ini sudah ada');
    return this.prisma.department.create({ data: { name: dto.name } });
  }

  async update(id: string, dto: DepartmentDto) {
    const dept = await this.prisma.department.findUnique({ where: { id } });
    if (!dept) throw new NotFoundException('Department tidak ditemukan');

    const existing = await this.prisma.department.findUnique({ where: { name: dto.name } });
    if (existing && existing.id !== id) {
      throw new ConflictException('Department dengan nama ini sudah ada');
    }
    return this.prisma.department.update({ where: { id }, data: { name: dto.name } });
  }

  async remove(id: string) {
    const dept = await this.prisma.department.findUnique({
      where: { id },
      include: { _count: { select: { users: true, tickets: true } } },
    });
    if (!dept) throw new NotFoundException('Department tidak ditemukan');

    if (dept._count.users > 0 || dept._count.tickets > 0) {
      throw new BadRequestException(
        'Department masih punya user atau ticket terkait — pindahkan/hapus dulu sebelum menghapus department ini',
      );
    }

    return this.prisma.department.delete({ where: { id } });
  }
}
