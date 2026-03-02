import { Controller, Post, Get, Patch, Delete, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';

import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, UpdateProfileDto, UpdatePasswordDto } from './dto';
import { JwtAuthGuard } from './guards';
import { CurrentUser } from './decorators';
import type { AuthenticatedUser } from '@/types';

@Controller('auth')
export class AuthController {
   constructor(private readonly authService: AuthService) {}

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
