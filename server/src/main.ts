import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';
import { HttpExceptionFilter, LoggingInterceptor } from '@/common';

async function bootstrap(): Promise<void> {
   const app = await NestFactory.create(AppModule);
   const config = app.get(ConfigService);
   const logger = new Logger('Bootstrap');

   // Global prefix: /api/v1
   app.setGlobalPrefix('api/v1');

   // CORS
   const corsOrigin = config.get<string>('cors.origin', 'http://localhost:3000');
   app.enableCors({
      origin: corsOrigin,
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
   });

   // Global pipes — validate request DTOs
   app.useGlobalPipes(
      new ValidationPipe({
         whitelist: true,
         forbidNonWhitelisted: true,
         transform: true,
         transformOptions: { enableImplicitConversion: true },
      }),
   );

   // Global filters & interceptors
   app.useGlobalFilters(new HttpExceptionFilter());
   app.useGlobalInterceptors(new LoggingInterceptor());

   const port = config.get<number>('port', 4000);
   await app.listen(port);

   logger.log(`🚀 API server running on http://localhost:${port}/api/v1`);
}

void bootstrap();
