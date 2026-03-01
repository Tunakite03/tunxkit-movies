import { PrismaLibSql } from '@prisma/adapter-libsql';

import { PrismaClient } from '@/generated/prisma/client';

function createPrismaClient(): PrismaClient {
   const url = process.env.DATABASE_URL;
   if (!url) throw new Error('DATABASE_URL environment variable is not set.');

   // PrismaLibSql accepts a libsql Config object (url + optional authToken)
   const adapter = new PrismaLibSql({ url });
   return new PrismaClient({ adapter });
}

// Prevent multiple PrismaClient instances in development hot-reload
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
   globalForPrisma.prisma = prisma;
}
