import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Guard that initiates Google OAuth2 authentication flow */
@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
   override getAuthenticateOptions(_ctx: ExecutionContext) {
      // Disable sessions — we use stateless JWT instead
      return { session: false };
   }

   override handleRequest<TUser>(err: Error | null, user: TUser | false): TUser {
      if (err || !user) {
         throw err ?? new UnauthorizedException('Google authentication failed');
      }
      return user;
   }
}
