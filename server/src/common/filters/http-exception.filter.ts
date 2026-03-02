import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';

/** Standardized error response shape */
interface ErrorResponse {
   readonly statusCode: number;
   readonly message: string;
   readonly error: string;
   readonly timestamp: string;
   readonly path: string;
}

/**
 * Global HTTP exception filter.
 * Catches all exceptions and returns a consistent error shape.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
   private readonly logger = new Logger(HttpExceptionFilter.name);

   catch(exception: unknown, host: ArgumentsHost): void {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();

      const { status, message, error } = this.extractErrorInfo(exception);

      const errorResponse: ErrorResponse = {
         statusCode: status,
         message,
         error,
         timestamp: new Date().toISOString(),
         path: request.url,
      };

      // Log internal errors but not client errors
      if (status >= 500) {
         this.logger.error(
            `${request.method} ${request.url}`,
            exception instanceof Error ? exception.stack : undefined,
         );
      }

      response.status(status).json(errorResponse);
   }

   private extractErrorInfo(exception: unknown): { status: number; message: string; error: string } {
      if (exception instanceof HttpException) {
         const status = exception.getStatus();
         const response = exception.getResponse();
         const message =
            typeof response === 'string'
               ? response
               : (((response as Record<string, unknown>)['message'] as string) ?? exception.message);
         const error =
            typeof response === 'string'
               ? 'Error'
               : (((response as Record<string, unknown>)['error'] as string) ?? 'Error');

         return {
            status,
            message: Array.isArray(message) ? message.join(', ') : message,
            error,
         };
      }

      return {
         status: HttpStatus.INTERNAL_SERVER_ERROR,
         message: 'Internal server error',
         error: 'Internal Server Error',
      };
   }
}
