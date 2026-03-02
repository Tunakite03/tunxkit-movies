'use client';

import { useActionState } from 'react';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { updateProfile } from '@/actions/auth-actions';
import type { ActionResult } from '@/actions/auth-actions';

const INITIAL_STATE: ActionResult = { success: true, message: '' };

interface ProfileFormProps {
   readonly defaultName: string;
}

export function ProfileForm({ defaultName }: ProfileFormProps) {
   const [state, formAction, isPending] = useActionState(updateProfile, INITIAL_STATE);

   return (
      <form
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
               htmlFor='name'
               className='text-sm font-medium'
            >
               Tên hiển thị
            </label>
            <Input
               id='name'
               name='name'
               defaultValue={defaultName}
               placeholder='Nguyễn Văn A'
               required
            />
         </div>

         <Button
            type='submit'
            disabled={isPending}
         >
            {isPending && <Loader2 className='mr-2 size-4 animate-spin' />}
            Lưu thay đổi
         </Button>
      </form>
   );
}
