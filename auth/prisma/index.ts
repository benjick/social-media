import { PrismaClient } from '@prisma/client';

export const createPrisma = () =>
  new PrismaClient({ log: ['query', 'info', 'warn'] });
