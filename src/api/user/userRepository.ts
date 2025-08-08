import prisma from '@/common/config/database';
import type { User } from '@/api/user/userModel';

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
}
