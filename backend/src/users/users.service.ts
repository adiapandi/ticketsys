import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuditLogService } from '../audit-log/audit-log.service';
import * as XLSX from 'xlsx';

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

  async bulkImport(fileBuffer: Buffer, actorId: string) {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    const results: {
      row: number;
      email: string;
      status: 'success' | 'failed';
      message: string;
      generatedPassword?: string;
    }[] = [];

    let successCount = 0;
    const validRoles = ['ADMIN', 'AGENT', 'CUSTOMER'];

    for (let i = 0; i < rows.length; i++) {
      const rowNum = i + 2; // baris 1 = header, jadi data pertama = baris 2
      const raw = rows[i];

      const name = String(raw.name || '').trim();
      const email = String(raw.email || '').trim().toLowerCase();
      let password = String(raw.password || '').trim();
      const roleInput = String(raw.role || '').trim().toUpperCase();

      if (!name || !email) {
        results.push({
          row: rowNum,
          email: email || '(kosong)',
          status: 'failed',
          message: 'Nama dan email wajib diisi',
        });
        continue;
      }

      const role = validRoles.includes(roleInput) ? roleInput : 'CUSTOMER';

      let generatedPassword: string | undefined;
      if (!password) {
        password = Math.random().toString(36).slice(-8) + 'A1!';
        generatedPassword = password;
      }

      const existing = await this.prisma.user.findUnique({ where: { email } });
      if (existing) {
        results.push({ row: rowNum, email, status: 'failed', message: 'Email sudah terdaftar' });
        continue;
      }

      try {
        const hashed = await bcrypt.hash(password, 10);
        await this.prisma.user.create({
          data: { email, password: hashed, name, role: role as any },
        });
        successCount++;
        results.push({
          row: rowNum,
          email,
          status: 'success',
          message: 'Berhasil dibuat',
          generatedPassword,
        });
      } catch {
        results.push({ row: rowNum, email, status: 'failed', message: 'Gagal membuat user' });
      }
    }

    await this.auditLogService.log(
      'BULK_USER_IMPORT',
      `Import massal user: ${successCount} berhasil dari ${rows.length} baris`,
      actorId,
    );

    return {
      total: rows.length,
      success: successCount,
      failed: rows.length - successCount,
      results,
    };
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
