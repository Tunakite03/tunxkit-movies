import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@/generated/prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
   private readonly logger = new Logger(PrismaService.name);

   constructor() {
      const url = process.env['DATABASE_URL'];
      if (!url) throw new Error('DATABASE_URL environment variable is not set.');

      const adapter = new PrismaLibSql({ url });
      super({ adapter });
   }

   async onModuleInit(): Promise<void> {
      await this.$connect();
      this.logger.log('Prisma connected to database');
   }

   async onModuleDestroy(): Promise<void> {
      await this.$disconnect();
      this.logger.log('Prisma disconnected from database');
   }
}
