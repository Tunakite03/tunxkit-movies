import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Guard that requires a valid JWT token */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
   override getRequest(context: ExecutionContext): unknown {
      return context.switchToHttp().getRequest();
   }
}
