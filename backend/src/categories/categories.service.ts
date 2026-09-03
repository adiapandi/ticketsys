import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

interface AuthUser {
  userId: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'AGENT' | 'CUSTOMER';
  departmentId?: string | null;
}

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  // Kalau departmentId diisi (misal saat create ticket, user sudah pilih department),
  // filter kategori cuma untuk department itu. Kalau kosong, tampilkan semua (dipakai admin/agent).
  findAll(departmentId?: string) {
    return this.prisma.category.findMany({
      where: departmentId ? { departmentId } : undefined,
      include: {
        _count: { select: { tickets: true } },
        department: { select: { id: true, name: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  private assertCanManage(actor: AuthUser, targetDepartmentId?: string | null) {
    if (actor.role === 'SUPER_ADMIN') return;
    if (actor.role !== 'ADMIN') {
      throw new ForbiddenException('Kamu tidak punya akses untuk mengelola kategori');
    }
    if (targetDepartmentId !== actor.departmentId) {
      throw new ForbiddenException('Kamu cuma bisa mengelola kategori di department kamu sendiri');
    }
  }

  async create(dto: CreateCategoryDto, actor: AuthUser) {
    // Admin (bukan super admin) hanya boleh bikin kategori untuk department-nya sendiri
    const departmentId = actor.role === 'SUPER_ADMIN' ? dto.departmentId : actor.departmentId;
    this.assertCanManage(actor, departmentId);

    const existing = await this.prisma.category.findFirst({ where: { name: dto.name, departmentId } });
    if (existing) throw new ConflictException('Kategori dengan nama ini sudah ada di department tersebut');

    return this.prisma.category.create({ data: { name: dto.name, departmentId } });
  }

  async update(id: string, dto: CreateCategoryDto, actor: AuthUser) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Kategori tidak ditemukan');
    this.assertCanManage(actor, category.departmentId);

    const existing = await this.prisma.category.findFirst({
      where: { name: dto.name, departmentId: category.departmentId },
    });
    if (existing && existing.id !== id) {
      throw new ConflictException('Kategori dengan nama ini sudah ada di department tersebut');
    }

    return this.prisma.category.update({ where: { id }, data: { name: dto.name } });
  }

  async remove(id: string, actor: AuthUser) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Kategori tidak ditemukan');
    this.assertCanManage(actor, category.departmentId);

    await this.prisma.ticket.updateMany({ where: { categoryId: id }, data: { categoryId: null } });
    return this.prisma.category.delete({ where: { id } });
  }
}
