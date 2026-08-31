import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService.changePassword', () => {
  let service: AuthService;
  let prisma: { user: { findUnique: jest.Mock; update: jest.Mock } };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: { sign: jest.fn().mockReturnValue('fake-token') } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('menolak kalau user tidak ditemukan', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      service.changePassword('user-1', { currentPassword: 'a', newPassword: 'newpass123' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('menolak kalau password saat ini salah', async () => {
    const hashed = await bcrypt.hash('passwordbenar', 10);
    prisma.user.findUnique.mockResolvedValue({ id: 'user-1', password: hashed });

    await expect(
      service.changePassword('user-1', { currentPassword: 'passwordsalah', newPassword: 'newpass123' }),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('berhasil update password kalau password saat ini benar', async () => {
    const hashed = await bcrypt.hash('passwordbenar', 10);
    prisma.user.findUnique.mockResolvedValue({ id: 'user-1', password: hashed });
    prisma.user.update.mockResolvedValue({});

    const result = await service.changePassword('user-1', {
      currentPassword: 'passwordbenar',
      newPassword: 'passwordbaru123',
    });

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'user-1' } }),
    );
    expect(result.message).toBe('Password berhasil diubah');
  });
});
