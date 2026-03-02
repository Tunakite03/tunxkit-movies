import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';

import { PrismaService } from '@/prisma';
import { RegisterDto, LoginDto, UpdateProfileDto, UpdatePasswordDto } from './dto';
import type { GoogleProfile } from './strategies';

/** Auth response with JWT token */
export interface AuthResponse {
   readonly accessToken: string;
   readonly user: {
      readonly id: string;
      readonly name: string | null;
      readonly email: string;
      readonly image: string | null;
   };
}

/** Simple action result */
export interface ActionResult {
   readonly success: boolean;
   readonly message: string;
}

@Injectable()
export class AuthService {
   constructor(
      private readonly prisma: PrismaService,
      private readonly jwt: JwtService,
   ) {}

   /** Register a new user with email + password */
   async register(dto: RegisterDto): Promise<AuthResponse> {
      const existing = await this.prisma.user.findUnique({
         where: { email: dto.email.trim() },
      });

      if (existing) {
         throw new ConflictException('Email này đã được đăng ký.');
      }

      const hashedPassword = await bcrypt.hash(dto.password, 12);

      const user = await this.prisma.user.create({
         data: {
            name: dto.name?.trim() ?? null,
            email: dto.email.trim(),
            password: hashedPassword,
         },
      });

      return this.buildAuthResponse(user);
   }

   /** Authenticate user with email + password */
   async login(dto: LoginDto): Promise<AuthResponse> {
      const user = await this.prisma.user.findUnique({
         where: { email: dto.email.trim() },
      });

      if (!user?.password) {
         throw new UnauthorizedException('Email hoặc mật khẩu không đúng.');
      }

      const isValid = await bcrypt.compare(dto.password, user.password);
      if (!isValid) {
         throw new UnauthorizedException('Email hoặc mật khẩu không đúng.');
      }

      return this.buildAuthResponse(user);
   }

   /** Get current authenticated user profile */
   async getProfile(userId: string) {
      const user = await this.prisma.user.findUnique({
         where: { id: userId },
         select: { id: true, name: true, email: true, image: true, createdAt: true },
      });

      if (!user) {
         throw new UnauthorizedException('Người dùng không tồn tại.');
      }

      return user;
   }

   /** Update user profile (name, image) */
   async updateProfile(userId: string, dto: UpdateProfileDto): Promise<ActionResult> {
      await this.prisma.user.update({
         where: { id: userId },
         data: {
            name: dto.name.trim(),
            ...(dto.image !== undefined ? { image: dto.image } : {}),
         },
      });

      return { success: true, message: 'Cập nhật hồ sơ thành công.' };
   }

   /** Change user password */
   async updatePassword(userId: string, dto: UpdatePasswordDto): Promise<ActionResult> {
      const user = await this.prisma.user.findUnique({
         where: { id: userId },
      });

      if (!user?.password) {
         throw new BadRequestException('Tài khoản này không dùng mật khẩu.');
      }

      const isValid = await bcrypt.compare(dto.currentPassword, user.password);
      if (!isValid) {
         throw new UnauthorizedException('Mật khẩu hiện tại không đúng.');
      }

      const hashedPassword = await bcrypt.hash(dto.newPassword, 12);
      await this.prisma.user.update({
         where: { id: userId },
         data: { password: hashedPassword },
      });

      return { success: true, message: 'Đổi mật khẩu thành công.' };
   }

   /** Delete user account permanently */
   async deleteAccount(userId: string): Promise<ActionResult> {
      await this.prisma.user.delete({ where: { id: userId } });
      return { success: true, message: 'Tài khoản đã được xóa.' };
   }

   /**
    * Handle Google OAuth login.
    * Creates a new user + account link if first login, or returns existing user.
    */
   async googleLogin(profile: GoogleProfile): Promise<AuthResponse> {
      // Check if this Google account is already linked
      const existingAccount = await this.prisma.account.findUnique({
         where: {
            provider_providerAccountId: {
               provider: 'google',
               providerAccountId: profile.googleId,
            },
         },
         include: { user: true },
      });

      if (existingAccount) {
         return this.buildAuthResponse(existingAccount.user);
      }

      // Check if a user with this email already exists (registered via credentials)
      const existingUser = await this.prisma.user.findUnique({
         where: { email: profile.email },
      });

      if (existingUser) {
         // Link Google account to existing user
         await this.prisma.account.create({
            data: {
               userId: existingUser.id,
               type: 'oauth',
               provider: 'google',
               providerAccountId: profile.googleId,
            },
         });

         // Update user image from Google if not already set
         if (!existingUser.image && profile.image) {
            await this.prisma.user.update({
               where: { id: existingUser.id },
               data: { image: profile.image },
            });
         }

         return this.buildAuthResponse({
            ...existingUser,
            image: existingUser.image ?? profile.image,
         });
      }

      // Create brand-new user + linked Google account
      const newUser = await this.prisma.user.create({
         data: {
            email: profile.email,
            name: profile.name,
            image: profile.image,
            accounts: {
               create: {
                  type: 'oauth',
                  provider: 'google',
                  providerAccountId: profile.googleId,
               },
            },
         },
      });

      return this.buildAuthResponse(newUser);
   }

   /** Build JWT auth response from user record */
   private buildAuthResponse(user: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
   }): AuthResponse {
      const payload = { sub: user.id, email: user.email };
      const accessToken = this.jwt.sign(payload);

      return {
         accessToken,
         user: {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
         },
      };
   }
}
