import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import type { Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

/** Profile data extracted from Google OAuth response */
export interface GoogleProfile {
   readonly googleId: string;
   readonly email: string;
   readonly name: string | null;
   readonly image: string | null;
}

/**
 * Google OAuth2 strategy for Passport.
 * Validates Google user profile and passes it to the route handler.
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
   constructor(config: ConfigService) {
      const clientID = config.get<string>('google.clientId');
      const clientSecret = config.get<string>('google.clientSecret');
      const callbackURL = config.get<string>('google.callbackUrl');

      if (!clientID || !clientSecret) {
         throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be configured');
      }

      super({
         clientID,
         clientSecret,
         callbackURL: callbackURL ?? 'http://localhost:4000/api/v1/auth/google/callback',
         scope: ['email', 'profile'],
      });
   }

   /**
    * Extract user profile from Google OAuth response.
    * Called by Passport after successful Google authentication.
    */
   validate(_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback): void {
      const email = profile.emails?.[0]?.value;

      if (!email) {
         done(new Error('Không thể lấy email từ Google.'), undefined);
         return;
      }

      const googleProfile: GoogleProfile = {
         googleId: profile.id,
         email,
         name: profile.displayName ?? null,
         image: profile.photos?.[0]?.value ?? null,
      };

      done(null, googleProfile);
   }
}
