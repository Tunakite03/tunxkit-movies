import { Controller, Post, Get, Patch, Delete, Body, UseGuards, HttpCode, HttpStatus, Res, Req } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, UpdateProfileDto, UpdatePasswordDto } from './dto';
import { JwtAuthGuard, GoogleAuthGuard } from './guards';
import { CurrentUser } from './decorators';
import type { AuthenticatedUser } from '@/types';
import type { GoogleProfile } from './strategies';

@Controller('auth')
export class AuthController {
   constructor(
      private readonly authService: AuthService,
      private readonly config: ConfigService,
   ) {}

   /** POST /auth/register — Register a new user */
   @Post('register')
   register(@Body() dto: RegisterDto) {
      return this.authService.register(dto);
   }

   /** POST /auth/login — Login with credentials */
   @Post('login')
   @HttpCode(HttpStatus.OK)
   login(@Body() dto: LoginDto) {
      return this.authService.login(dto);
   }

   /** GET /auth/google — Initiate Google OAuth flow */
   @Get('google')
   @UseGuards(GoogleAuthGuard)
   googleAuth() {
      // Guard redirects to Google — this body is never reached
   }

   /** GET /auth/google/callback — Google OAuth callback */
   @Get('google/callback')
   @UseGuards(GoogleAuthGuard)
   async googleCallback(@Req() req: Request, @Res() res: Response) {
      const profile = req.user as GoogleProfile;
      const { accessToken } = await this.authService.googleLogin(profile);
      const frontendUrl = this.config.get<string>('cors.origin', 'http://localhost:3000');

      res.redirect(`${frontendUrl}/auth/google/callback?token=${encodeURIComponent(accessToken)}`);
   }

   /** GET /auth/me — Get current user profile */
   @Get('me')
   @UseGuards(JwtAuthGuard)
   getProfile(@CurrentUser() user: AuthenticatedUser) {
      return this.authService.getProfile(user.id);
   }

   /** PATCH /auth/profile — Update profile */
   @Patch('profile')
   @UseGuards(JwtAuthGuard)
   updateProfile(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateProfileDto) {
      return this.authService.updateProfile(user.id, dto);
   }

   /** PATCH /auth/password — Change password */
   @Patch('password')
   @UseGuards(JwtAuthGuard)
   updatePassword(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdatePasswordDto) {
      return this.authService.updatePassword(user.id, dto);
   }

   /** DELETE /auth/account — Delete account */
   @Delete('account')
   @UseGuards(JwtAuthGuard)
   deleteAccount(@CurrentUser() user: AuthenticatedUser) {
      return this.authService.deleteAccount(user.id);
   }
}
