import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
  ) {}

  async create(dto: CreateUserDto, actorId: string) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email sudah terdaftar');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        name: dto.name,
        role: dto.role,
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    await this.auditLogService.log(
      'USER_CREATED',
      `User baru dibuat: ${user.name} (${user.email}, role ${user.role})`,
      actorId,
    );

    return user;
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

    const target = await this.prisma.user.findUnique({ where: { id } });
    if (!target) throw new NotFoundException('User tidak ditemukan');

    const updated = await this.prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, name: true, role: true },
    });

    await this.auditLogService.log(
      'ROLE_CHANGED',
      `Role ${target.name} diubah dari ${target.role} menjadi ${role}`,
      requestingUserId,
    );

    return updated;
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

    await this.prisma.ticket.updateMany({ where: { assigneeId: id }, data: { assigneeId: null } });

    await this.auditLogService.log(
      'USER_DELETED',
      `User dihapus: ${user.name} (${user.email})`,
      requestingUserId,
    );

    return this.prisma.user.delete({ where: { id } });
  }
}
