'use client';

import { useActionState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signInWithCredentials } from '@/actions/auth-actions';
import type { ActionResult } from '@/actions/auth-actions';

const INITIAL_STATE: ActionResult = { success: true, message: '' };

export default function SignInPage() {
   const [state, formAction, isPending] = useActionState(signInWithCredentials, INITIAL_STATE);
   const router = useRouter();

   // Redirect to home after successful login
   useEffect(() => {
      if (state.success && state.message) {
         router.push('/');
      }
   }, [state, router]);

   return (
      <div className='w-full max-w-sm space-y-6'>
         <div className='text-center'>
            <h1 className='text-2xl font-bold tracking-tight'>Đăng nhập</h1>
            <p className='mt-1 text-sm text-muted-foreground'>Chào mừng bạn quay trở lại!</p>
         </div>

         {/* Credentials form */}
         <form
            action={formAction}
            className='space-y-4'
         >
            {!state.success && state.message && (
               <p className='rounded-lg bg-destructive/10 p-3 text-sm text-destructive'>{state.message}</p>
            )}

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
                  autoComplete='current-password'
               />
            </div>

            <Button
               type='submit'
               className='w-full'
               disabled={isPending}
            >
               {isPending && <Loader2 className='mr-2 size-4 animate-spin' />}
               Đăng nhập
            </Button>
         </form>

         <p className='text-center text-sm text-muted-foreground'>
            Chưa có tài khoản?{' '}
            <Link
               href='/sign-up'
               className='font-medium text-primary hover:underline'
            >
               Đăng ký ngay
            </Link>
         </p>
      </div>
   );
}
