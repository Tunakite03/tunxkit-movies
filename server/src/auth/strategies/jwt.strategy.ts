import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { JwtPayload, AuthenticatedUser } from '@/types';
import { PrismaService } from '@/prisma';

/**
 * JWT strategy for Passport.
 * Validates JWT tokens and attaches the user to the request.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
   constructor(
      config: ConfigService,
      private readonly prisma: PrismaService,
   ) {
      const secret = config.get<string>('jwt.secret');
      if (!secret) throw new Error('JWT_SECRET is not configured');

      super({
         jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
         ignoreExpiration: false,
         secretOrKey: secret,
      });
   }

   /**
    * Validate JWT payload and return user.
    * Called by Passport after token verification.
    */
   async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
      const user = await this.prisma.user.findUnique({
         where: { id: payload.sub },
         select: { id: true, email: true, name: true },
      });

      if (!user) {
         throw new Error('User not found');
      }

      return { id: user.id, email: user.email, name: user.name };
   }
}
