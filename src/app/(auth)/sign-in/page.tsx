'use client';

import { useActionState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GoogleLoginButton } from '@/components/google-login-button';
import { signInWithCredentials } from '@/actions/auth-actions';
import type { ActionResult } from '@/actions/auth-actions';

const INITIAL_STATE: ActionResult = { success: true, message: '' };

export default function SignInPage() {
   const [state, formAction, isPending] = useActionState(signInWithCredentials, INITIAL_STATE);
   const router = useRouter();
   const searchParams = useSearchParams();
   const isPasswordReset = searchParams.get('reset') === '1';

   // Redirect to home after successful login
   useEffect(() => {
      if (state.success && state.message) {
         router.push('/');
      }
   }, [state, router]);

   return (
      <div className="w-full max-w-sm space-y-6">
         <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">Đăng nhập</h1>
            <p className="mt-1 text-sm text-muted-foreground">Chào mừng bạn quay trở lại!</p>
         </div>

         {/* Google OAuth */}
         <GoogleLoginButton />

         {/* Divider */}
         <div className="relative">
            <div className="absolute inset-0 flex items-center">
               <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
               <span className="bg-background px-2 text-muted-foreground">Hoặc</span>
            </div>
         </div>

         {/* Credentials form */}
         <form action={formAction} className="space-y-4">
            {isPasswordReset && (
               <p className="rounded-lg bg-primary/10 p-3 text-sm text-primary">
                  Đặt lại mật khẩu thành công. Bạn có thể đăng nhập ngay bây giờ.
               </p>
            )}
            {!state.success && state.message && (
               <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {state.message}
               </p>
            )}

            <div className="space-y-1.5">
               <label htmlFor="email" className="text-sm font-medium">
                  Email
               </label>
               <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="email@example.com"
                  required
                  autoComplete="email"
               />
            </div>

            <div className="space-y-1.5">
               <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium">
                     Mật khẩu
                  </label>
                  <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                     Quên mật khẩu?
                  </Link>
               </div>
               <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
               />
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
               {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
               Đăng nhập
            </Button>
         </form>

         <p className="text-center text-sm text-muted-foreground">
            Chưa có tài khoản?{' '}
            <Link href="/sign-up" className="font-medium text-primary hover:underline">
               Đăng ký ngay
            </Link>
         </p>
      </div>
   );
}
