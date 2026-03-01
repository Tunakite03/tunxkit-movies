'use client';

import { useActionState, useRef } from 'react';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { updatePassword } from '@/actions/auth-actions';
import type { ActionResult } from '@/actions/auth-actions';

const INITIAL_STATE: ActionResult = { success: true, message: '' };

export function PasswordForm() {
   const formRef = useRef<HTMLFormElement>(null);
   const [state, formAction, isPending] = useActionState(async (prev: ActionResult, formData: FormData) => {
      const result = await updatePassword(formData);
      if (result.success) formRef.current?.reset();
      return result;
   }, INITIAL_STATE);

   return (
      <form
         ref={formRef}
         action={formAction}
         className='space-y-4'
      >
         {state.message && (
            <p
               className={`rounded-lg p-3 text-sm ${state.success ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-destructive/10 text-destructive'}`}
            >
               {state.message}
            </p>
         )}

         <div className='space-y-1.5'>
            <label
               htmlFor='currentPassword'
               className='text-sm font-medium'
            >
               Mật khẩu hiện tại
            </label>
            <Input
               id='currentPassword'
               name='currentPassword'
               type='password'
               placeholder='••••••••'
               required
               autoComplete='current-password'
            />
         </div>

         <div className='space-y-1.5'>
            <label
               htmlFor='newPassword'
               className='text-sm font-medium'
            >
               Mật khẩu mới
            </label>
            <Input
               id='newPassword'
               name='newPassword'
               type='password'
               placeholder='••••••••'
               required
               minLength={8}
               autoComplete='new-password'
            />
         </div>

         <Button
            type='submit'
            disabled={isPending}
         >
            {isPending && <Loader2 className='mr-2 size-4 animate-spin' />}
            Đổi mật khẩu
         </Button>
      </form>
   );
}
