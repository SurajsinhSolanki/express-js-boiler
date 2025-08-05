import { PrismaClient } from '@prisma/client';
import { seedUsers } from './Users';

const prisma = new PrismaClient();

const seed = async () => {
  try {
    console.log('Seeding process started...');

    // Seed users
    await seedUsers();

    console.log('Seeding completed!');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
};

seed();
