import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const seedUsers = async () => {
  try {
    await prisma.user.create({
      data: {
        email: 'user@mail.com',
        phoneNumber: '1234567890',
        password: await bcrypt.hash('Test@123', 10), // Hash the password
        isVerified: true,
        isAdmin: false,
        emailVerified: true,
        phoneVerified: true
      }
    });

    await prisma.user.create({
      data: {
        email: 'admin@mail.com',
        phoneNumber: '9876543210',
        password: await bcrypt.hash('Test@123', 10), // Hash the password
        isVerified: true,
        isAdmin: true,
        emailVerified: false,
        phoneVerified: false
      }
    });

    console.log('Users seeded!');
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
};
