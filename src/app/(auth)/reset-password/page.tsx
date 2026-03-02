'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { resetPassword } from '@/actions/auth-actions';

export default function ResetPasswordPage() {
   const router = useRouter();
   const searchParams = useSearchParams();
   const token = searchParams.get('token') ?? '';

   const [isPending, startTransition] = useTransition();
   const [error, setError] = useState('');

   // Guard — if no token in URL, redirect to forgot-password
   useEffect(() => {
      if (!token) {
         router.replace('/forgot-password');
      }
   }, [token, router]);

   function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const password = (formData.get('password') as string | null) ?? '';
      const confirm = (formData.get('confirmPassword') as string | null) ?? '';

      if (password !== confirm) {
         setError('Mật khẩu xác nhận không khớp.');
         return;
      }
      setError('');

      startTransition(async () => {
         const result = await resetPassword(token, password);
         if (!result.success) {
            setError(result.message);
            return;
         }
         router.push('/sign-in?reset=1');
      });
   }

   return (
      <div className="w-full max-w-sm space-y-6">
         <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">Đặt lại mật khẩu</h1>
            <p className="mt-1 text-sm text-muted-foreground">
               Nhập mật khẩu mới cho tài khoản của bạn.
            </p>
         </div>

         <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
               <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
            )}

            <div className="space-y-1.5">
               <label htmlFor="password" className="text-sm font-medium">
                  Mật khẩu mới
               </label>
               <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  minLength={8}
                  autoComplete="new-password"
               />
            </div>

            <div className="space-y-1.5">
               <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Xác nhận mật khẩu
               </label>
               <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  required
                  minLength={8}
                  autoComplete="new-password"
               />
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
               {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
               Đặt lại mật khẩu
            </Button>
         </form>

         <p className="text-center text-sm text-muted-foreground">
            <Link href="/sign-in" className="font-medium text-primary hover:underline">
               Quay lại đăng nhập
            </Link>
         </p>
      </div>
   );
}
