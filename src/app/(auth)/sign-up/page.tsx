'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Chrome, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { signUp, signInWithGoogle } from '@/actions/auth-actions';

export default function SignUpPage() {
   const router = useRouter();
   const [error, setError] = useState('');
   const [isPending, startTransition] = useTransition();
   const [isGooglePending, startGoogle] = useTransition();

   function handleGoogleSignIn() {
      startGoogle(async () => {
         await signInWithGoogle();
      });
   }

   function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const password = formData.get('password') as string;
      const confirm = formData.get('confirmPassword') as string;

      if (password !== confirm) {
         setError('Mật khẩu xác nhận không khớp.');
         return;
      }
      setError('');

      startTransition(async () => {
         const result = await signUp(formData);
         if (!result.success) {
            setError(result.message);
            return;
         }
         // Auto sign-in after successful registration
         router.push('/sign-in?registered=1');
      });
   }

   return (
      <div className='w-full max-w-sm space-y-6'>
         <div className='text-center'>
            <h1 className='text-2xl font-bold tracking-tight'>Tạo tài khoản</h1>
            <p className='mt-1 text-sm text-muted-foreground'>Đăng ký để lưu danh sách yêu thích của bạn</p>
         </div>

         {/* Google OAuth */}
         <Button
            type='button'
            variant='outline'
            className='w-full gap-2'
            onClick={handleGoogleSignIn}
            disabled={isGooglePending || isPending}
         >
            {isGooglePending ? <Loader2 className='size-4 animate-spin' /> : <Chrome className='size-4' />}
            Tiếp tục với Google
         </Button>

         <div className='flex items-center gap-3'>
            <Separator className='flex-1' />
            <span className='text-xs text-muted-foreground'>hoặc</span>
            <Separator className='flex-1' />
         </div>

         {/* Registration form */}
         <form
            onSubmit={handleSubmit}
            className='space-y-4'
         >
            {error && <p className='rounded-lg bg-destructive/10 p-3 text-sm text-destructive'>{error}</p>}

            <div className='space-y-1.5'>
               <label
                  htmlFor='name'
                  className='text-sm font-medium'
               >
                  Họ tên
               </label>
               <Input
                  id='name'
                  name='name'
                  type='text'
                  placeholder='Nguyễn Văn A'
                  autoComplete='name'
               />
            </div>

            <div className='space-y-1.5'>
               <label
                  htmlFor='email'
                  className='text-sm font-medium'
               >
                  Email
               </label>
               <Input
                  id='email'
                  name='email'
                  type='email'
                  placeholder='email@example.com'
                  required
                  autoComplete='email'
               />
            </div>

            <div className='space-y-1.5'>
               <label
                  htmlFor='password'
                  className='text-sm font-medium'
               >
                  Mật khẩu
               </label>
               <Input
                  id='password'
                  name='password'
                  type='password'
                  placeholder='••••••••'
                  required
                  minLength={8}
                  autoComplete='new-password'
               />
            </div>

            <div className='space-y-1.5'>
               <label
                  htmlFor='confirmPassword'
                  className='text-sm font-medium'
               >
                  Xác nhận mật khẩu
               </label>
               <Input
                  id='confirmPassword'
                  name='confirmPassword'
                  type='password'
                  placeholder='••••••••'
                  required
                  autoComplete='new-password'
               />
            </div>

            <Button
               type='submit'
               className='w-full'
               disabled={isPending || isGooglePending}
            >
               {isPending && <Loader2 className='mr-2 size-4 animate-spin' />}
               Đăng ký
            </Button>
         </form>

         <p className='text-center text-sm text-muted-foreground'>
            Đã có tài khoản?{' '}
            <Link
               href='/sign-in'
               className='font-medium text-primary hover:underline'
            >
               Đăng nhập
            </Link>
         </p>
      </div>
   );
}
