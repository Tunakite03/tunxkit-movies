'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Loader2, MailCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { forgotPassword } from '@/actions/auth-actions';

export default function ForgotPasswordPage() {
   const [isPending, startTransition] = useTransition();
   const [sent, setSent] = useState(false);
   const [error, setError] = useState('');

   function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault();
      const email = (new FormData(event.currentTarget).get('email') as string | null) ?? '';
      setError('');

      startTransition(async () => {
         const result = await forgotPassword(email);
         if (!result.success) {
            setError(result.message);
            return;
         }
         setSent(true);
      });
   }

   if (sent) {
      return (
         <div className="w-full max-w-sm space-y-4 text-center">
            <MailCheck className="mx-auto size-12 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Kiểm tra email của bạn</h1>
            <p className="text-sm text-muted-foreground">
               Nếu địa chỉ email tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi. Hãy kiểm tra hộp
               thư đến (và thư rác) của bạn.
            </p>
            <Link
               href="/sign-in"
               className="block text-sm font-medium text-primary hover:underline"
            >
               Quay lại đăng nhập
            </Link>
         </div>
      );
   }

   return (
      <div className="w-full max-w-sm space-y-6">
         <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">Quên mật khẩu?</h1>
            <p className="mt-1 text-sm text-muted-foreground">
               Nhập email của bạn để nhận liên kết đặt lại mật khẩu.
            </p>
         </div>

         <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
               <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
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

            <Button type="submit" className="w-full" disabled={isPending}>
               {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
               Gửi liên kết đặt lại
            </Button>
         </form>

         <p className="text-center text-sm text-muted-foreground">
            Nhớ mật khẩu rồi?{' '}
            <Link href="/sign-in" className="font-medium text-primary hover:underline">
               Đăng nhập
            </Link>
         </p>
      </div>
   );
}
