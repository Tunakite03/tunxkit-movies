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
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function getClient(): PrismaClient {
   if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createPrismaClient();
   }
   return globalForPrisma.prisma;
}

/**
 * Lazy Prisma client proxy.
 * The underlying PrismaClient is only instantiated on the first database call,
 * not at module evaluation time. This prevents Next.js builds from failing
 * when DATABASE_URL is not available during static analysis / page-data collection.
 */
export const prisma = new Proxy({} as PrismaClient, {
   get(_target, prop: string | symbol) {
      const client = getClient();
      const value = Reflect.get(client, prop, client) as unknown;
      if (typeof value === 'function') {
         return (value as (...args: unknown[]) => unknown).bind(client);
      }
      return value;
   },
});
