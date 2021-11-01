import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

export const getPrisma = () => {
  if (!prisma) {
    prisma = new PrismaClient({ log: ['query', 'info', 'warn'] });
  }
  return prisma;
};
