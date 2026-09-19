/**
 * database.ts — Singleton Prisma Client.
 */

import { PrismaClient } from '../../generated/prisma/client';

export const prisma = new PrismaClient();

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
