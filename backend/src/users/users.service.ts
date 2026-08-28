import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email sudah terdaftar');

    const hashed = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        name: dto.name,
        role: dto.role,
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: { select: { ticketsCreated: true, ticketsAssigned: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  findAgentsAndAdmins() {
    return this.prisma.user.findMany({
      where: { role: { in: ['AGENT', 'ADMIN'] } },
      select: { id: true, email: true, name: true, role: true },
      orderBy: { name: 'asc' },
    });
  }

  async updateRole(id: string, role: 'ADMIN' | 'AGENT' | 'CUSTOMER', requestingUserId: string) {
    if (id === requestingUserId && role !== 'ADMIN') {
      throw new BadRequestException('Tidak bisa mengubah role akun sendiri agar tidak terkunci dari akses admin');
    }
    return this.prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, name: true, role: true },
    });
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
  }

  async remove(id: string, requestingUserId: string) {
    if (id === requestingUserId) {
      throw new BadRequestException('Tidak bisa menghapus akun sendiri');
    }
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User tidak ditemukan');

    // Lepas assignment ticket yang dipegang user ini, jangan ikut kehapus
    await this.prisma.ticket.updateMany({ where: { assigneeId: id }, data: { assigneeId: null } });

    return this.prisma.user.delete({ where: { id } });
  }
}
