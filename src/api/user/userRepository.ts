import { prisma } from '@/common/config/database';
import type { User } from '@/api/user/userModel';
import { VerificationType } from '@prisma/client';
import { randomBytes } from 'crypto';
import { DateTime } from 'luxon';

export class UserRepository {
  async findAllAsync(): Promise<User[]> {
    return prisma.user.findMany({
      where: { deletedAt: null }
    });
  }

  async findByIdAsync(id: number): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id, deletedAt: null }
    });
  }

  async findByEmailAsync(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email, deletedAt: null }
    });
  }

  async findByPhoneNumberAsync(phoneNumber: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { phoneNumber, deletedAt: null }
    });
  }

  async createAsync(user: User): Promise<User> {
    return prisma.user.create({
      data: user
    });
  }

  async updateAsync(id: number, user: User): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: user
    });
  }

  async deleteAsync(id: number): Promise<User> {
    return prisma.user.delete({
      where: { id }
    });
  }

  async createVerificationTokenAsync(
    userId: number,
    type: VerificationType
  ): Promise<{ id: number; token: string; expiresAt: Date } | null> {
    const token = randomBytes(32).toString('hex');
    const expiresAt = DateTime.now().plus({ minutes: 60 }).toJSDate(); // Default 60 minutes for verification tokens

    const verification = await prisma.userVerification.create({
      data: {
        userId,
        verificationType: type,
        token: token,
        expiresAt
      },
      select: {
        id: true,
        token: true,
        expiresAt: true
      }
    });
    return verification;
  }

  async createRefreshTokenAsync(
    userId: number,
    token: string,
    expiresAt: Date
  ): Promise<{ id: number; token: string; expiresAt: Date; isUsed: boolean } | null> {
    const refreshToken = await prisma.userVerification.create({
      data: {
        userId,
        verificationType: VerificationType.REFRESH_TOKEN,
        token,
        expiresAt,
        isUsed: false // Initially not used/revoked
      },
      select: {
        id: true,
        token: true,
        expiresAt: true,
        isUsed: true
      }
    });
    return refreshToken;
  }

  async findVerificationTokenAsync(
    token: string,
    type: VerificationType
  ): Promise<{ id: number; userId: number; token: string; expiresAt: Date; isUsed: boolean } | null> {
    return prisma.userVerification.findFirst({
      where: {
        token,
        verificationType: type,
        isUsed: false
      }
    });
  }

  async findRefreshTokenAsync(
    token: string
  ): Promise<{ id: number; userId: number; token: string; expiresAt: Date; isUsed: boolean } | null> {
    return prisma.userVerification.findFirst({
      where: {
        token,
        verificationType: VerificationType.REFRESH_TOKEN,
        isUsed: false // isUsed here means not revoked
      }
    });
  }

  async markVerificationTokenAsUsedAsync(id: number): Promise<void> {
    await prisma.userVerification.update({
      where: { id },
      data: { isUsed: true }
    });
  }
}
