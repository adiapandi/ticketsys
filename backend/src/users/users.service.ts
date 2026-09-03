import { Injectable, ConflictException, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuditLogService } from '../audit-log/audit-log.service';
import * as XLSX from 'xlsx';

interface AuthUser {
  userId: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'AGENT' | 'CUSTOMER';
  departmentId?: string | null;
}

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
  ) {}

  // Validasi & tentukan role+department yang boleh dibuat/diubah oleh actor
  private resolveRoleAndDept(
    requestedRole: string,
    requestedDeptId: string | undefined,
    actor: AuthUser,
  ): { role: string; departmentId: string | null } {
    if (requestedRole === 'SUPER_ADMIN' && actor.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Cuma Super Admin yang bisa membuat/menaikkan user jadi Super Admin');
    }
    if (requestedRole === 'ADMIN' && actor.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Cuma Super Admin yang bisa membuat/menaikkan user jadi Admin department');
    }

    if (requestedRole === 'CUSTOMER' || requestedRole === 'SUPER_ADMIN') {
      return { role: requestedRole, departmentId: null };
    }

    // ADMIN atau AGENT wajib punya department
    const departmentId = actor.role === 'SUPER_ADMIN' ? requestedDeptId : actor.departmentId;
    if (!departmentId) {
      throw new BadRequestException('Department wajib dipilih untuk role Admin/Agent');
    }
    return { role: requestedRole, departmentId };
  }

  async create(dto: CreateUserDto, actor: AuthUser) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email sudah terdaftar');

    const { role, departmentId } = this.resolveRoleAndDept(dto.role, dto.departmentId, actor);

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        name: dto.name,
        role: role as any,
        departmentId,
      },
      select: { id: true, email: true, name: true, role: true, departmentId: true, createdAt: true },
    });

    await this.auditLogService.log(
      'USER_CREATED',
      `User baru dibuat: ${user.name} (${user.email}, role ${user.role})`,
      actor.userId,
    );

    return user;
  }

  findAll(actor: AuthUser) {
    // Super Admin lihat semua. Admin department cuma lihat staff department-nya + semua customer
    // (customer tidak terikat 1 department karena bisa bikin ticket ke department manapun).
    const where =
      actor.role === 'SUPER_ADMIN'
        ? undefined
        : {
            OR: [{ departmentId: actor.departmentId }, { role: 'CUSTOMER' as any }],
          };

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        departmentId: true,
        createdAt: true,
        department: { select: { id: true, name: true } },
        _count: { select: { ticketsCreated: true, ticketsAssigned: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  findAgentsAndAdmins(departmentId?: string) {
    return this.prisma.user.findMany({
      where: {
        role: { in: ['AGENT', 'ADMIN', 'SUPER_ADMIN'] },
        ...(departmentId ? { OR: [{ departmentId }, { role: 'SUPER_ADMIN' }] } : {}),
      },
      select: { id: true, email: true, name: true, role: true, departmentId: true },
      orderBy: { name: 'asc' },
    });
  }

  async updateRole(
    id: string,
    role: 'SUPER_ADMIN' | 'ADMIN' | 'AGENT' | 'CUSTOMER',
    departmentId: string | undefined,
    actor: AuthUser,
  ) {
    if (id === actor.userId && role !== 'SUPER_ADMIN' && role !== actor.role) {
      throw new BadRequestException('Tidak bisa mengubah role akun sendiri agar tidak terkunci dari akses admin');
    }

    const target = await this.prisma.user.findUnique({ where: { id } });
    if (!target) throw new NotFoundException('User tidak ditemukan');

    if (actor.role !== 'SUPER_ADMIN' && target.departmentId !== actor.departmentId && target.role !== 'CUSTOMER') {
      throw new ForbiddenException('Kamu cuma bisa mengubah user di department kamu sendiri');
    }

    const resolved = this.resolveRoleAndDept(role, departmentId, actor);

    const updated = await this.prisma.user.update({
      where: { id },
      data: { role: resolved.role as any, departmentId: resolved.departmentId },
      select: { id: true, email: true, name: true, role: true, departmentId: true },
    });

    await this.auditLogService.log(
      'ROLE_CHANGED',
      `Role ${target.name} diubah dari ${target.role} menjadi ${resolved.role}`,
      actor.userId,
    );

    return updated;
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true, departmentId: true, createdAt: true },
    });
  }

  async remove(id: string, actor: AuthUser) {
    if (id === actor.userId) {
      throw new BadRequestException('Tidak bisa menghapus akun sendiri');
    }
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User tidak ditemukan');

    if (actor.role !== 'SUPER_ADMIN' && user.departmentId !== actor.departmentId && user.role !== 'CUSTOMER') {
      throw new ForbiddenException('Kamu cuma bisa menghapus user di department kamu sendiri');
    }

    await this.prisma.ticket.updateMany({ where: { assigneeId: id }, data: { assigneeId: null } });

    await this.auditLogService.log('USER_DELETED', `User dihapus: ${user.name} (${user.email})`, actor.userId);

    return this.prisma.user.delete({ where: { id } });
  }

  async bulkImport(fileBuffer: Buffer, actor: AuthUser) {
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
    const validRoles = ['ADMIN', 'AGENT', 'CUSTOMER']; // SUPER_ADMIN tidak boleh dibuat lewat bulk import

    for (let i = 0; i < rows.length; i++) {
      const rowNum = i + 2;
      const raw = rows[i];

      const name = String(raw.name || '').trim();
      const email = String(raw.email || '').trim().toLowerCase();
      let password = String(raw.password || '').trim();
      const roleInput = String(raw.role || '').trim().toUpperCase();
      const role = validRoles.includes(roleInput) ? roleInput : 'CUSTOMER';

      if (!name || !email) {
        results.push({ row: rowNum, email: email || '(kosong)', status: 'failed', message: 'Nama dan email wajib diisi' });
        continue;
      }

      let departmentId: string | null = null;
      if (role === 'ADMIN' || role === 'AGENT') {
        departmentId = actor.role === 'SUPER_ADMIN' ? null : actor.departmentId || null;
        // Dept admin: semua staff yang diimport otomatis masuk department dia sendiri
        if (actor.role !== 'SUPER_ADMIN' && !departmentId) {
          results.push({ row: rowNum, email, status: 'failed', message: 'Actor tidak punya department' });
          continue;
        }
      }

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
          data: { email, password: hashed, name, role: role as any, departmentId },
        });
        successCount++;
        results.push({ row: rowNum, email, status: 'success', message: 'Berhasil dibuat', generatedPassword });
      } catch {
        results.push({ row: rowNum, email, status: 'failed', message: 'Gagal membuat user' });
      }
    }

    await this.auditLogService.log(
      'BULK_USER_IMPORT',
      `Import massal user: ${successCount} berhasil dari ${rows.length} baris`,
      actor.userId,
    );

    return { total: rows.length, success: successCount, failed: rows.length - successCount, results };
  }
}
