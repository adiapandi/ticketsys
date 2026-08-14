import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
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

  async updateRole(id: string, role: 'ADMIN' | 'AGENT' | 'CUSTOMER') {
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
}
