'use server';

import bcrypt from 'bcryptjs';
import { AuthError } from 'next-auth';

import { prisma } from '@/lib/prisma';
import { auth, signIn, signOut } from '@/auth';

/** Result type for user-facing server actions */
export interface ActionResult {
   readonly success: boolean;
   readonly message: string;
}

/** Register a new user with email + password */
export async function signUp(formData: FormData): Promise<ActionResult> {
   const name = formData.get('name') as string | null;
   const email = formData.get('email') as string | null;
   const password = formData.get('password') as string | null;

   if (!email?.trim() || !password?.trim()) {
      return { success: false, message: 'Email và mật khẩu không được để trống.' };
   }
   if (password.length < 8) {
      return { success: false, message: 'Mật khẩu phải có ít nhất 8 ký tự.' };
   }

   const existing = await prisma.user.findUnique({ where: { email: email.trim() } });
   if (existing) {
      return { success: false, message: 'Email này đã được đăng ký.' };
   }

   const hashed = await bcrypt.hash(password, 12);
   await prisma.user.create({
      data: {
         name: name?.trim() || null,
         email: email.trim(),
         password: hashed,
      },
   });

   return { success: true, message: 'Đăng ký thành công! Đang đăng nhập...' };
}

/** Sign in with credentials — returns error or redirects on success */
export async function signInWithCredentials(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
   try {
      await signIn('credentials', {
         email: formData.get('email'),
         password: formData.get('password'),
         redirectTo: '/',
      });
      // signIn with redirectTo will throw a NEXT_REDIRECT — unreachable here
      return { success: true, message: '' };
   } catch (error) {
      // Re-throw Next.js redirect responses
      if (error instanceof Error && error.message === 'NEXT_REDIRECT') throw error;
      if (error instanceof AuthError) {
         switch (error.type) {
            case 'CredentialsSignin':
               return { success: false, message: 'Email hoặc mật khẩu không đúng.' };
            default:
               return { success: false, message: 'Lỗi xác thực. Vui lòng thử lại.' };
         }
      }
      return { success: false, message: 'Đã xảy ra lỗi. Vui lòng thử lại.' };
   }
}

/** Sign in with Google OAuth */
export async function signInWithGoogle(): Promise<void> {
   await signIn('google', { redirectTo: '/' });
}

/** Sign out */
export async function signOutAction(): Promise<void> {
   await signOut({ redirectTo: '/' });
}

/** Update the current user's display name */
export async function updateProfile(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
   const session = await auth();
   if (!session?.user?.id) {
      return { success: false, message: 'Bạn cần đăng nhập để thực hiện thao tác này.' };
   }

   const name = formData.get('name') as string | null;
   if (!name?.trim()) {
      return { success: false, message: 'Tên hiển thị không được để trống.' };
   }

   await prisma.user.update({
      where: { id: session.user.id },
      data: { name: name.trim() },
   });

   return { success: true, message: 'Cập nhật tên thành công.' };
}

/** Change password for credentials-based accounts */
export async function updatePassword(formData: FormData): Promise<ActionResult> {
   const session = await auth();
   if (!session?.user?.id) {
      return { success: false, message: 'Bạn cần đăng nhập.' };
   }

   const currentPassword = formData.get('currentPassword') as string | null;
   const newPassword = formData.get('newPassword') as string | null;

   if (!currentPassword || !newPassword) {
      return { success: false, message: 'Vui lòng nhập đầy đủ thông tin.' };
   }
   if (newPassword.length < 8) {
      return { success: false, message: 'Mật khẩu mới phải có ít nhất 8 ký tự.' };
   }

   const user = await prisma.user.findUnique({ where: { id: session.user.id } });
   if (!user?.password) {
      return { success: false, message: 'Tài khoản này không dùng mật khẩu.' };
   }

   const isValid = await bcrypt.compare(currentPassword, user.password);
   if (!isValid) {
      return { success: false, message: 'Mật khẩu hiện tại không đúng.' };
   }

   const hashed = await bcrypt.hash(newPassword, 12);
   await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashed },
   });

   return { success: true, message: 'Đổi mật khẩu thành công.' };
}

/** Delete the current user's account */
export async function deleteAccount(): Promise<ActionResult> {
   const session = await auth();
   if (!session?.user?.id) {
      return { success: false, message: 'Bạn cần đăng nhập.' };
   }

   await prisma.user.delete({ where: { id: session.user.id } });
   await signOut({ redirectTo: '/' });

   return { success: true, message: 'Tài khoản đã được xóa.' };
}
