'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { deleteAccount, signOutAction } from '@/actions/auth-actions';

export function DangerZone() {
   const [isDeleting, setIsDeleting] = useState(false);
   const [confirm, setConfirm] = useState('');
   const [isSignOutPending, startSignOut] = useTransition();
   const [isDeletePending, startDelete] = useTransition();
   const router = useRouter();

   const CONFIRM_WORD = 'XÓA TÀI KHOẢN';

   function handleSignOut() {
      startSignOut(() => {
         signOutAction();
         router.push('/');
      });
   }

   function handleDeleteAccount() {
      if (confirm !== CONFIRM_WORD) return;
      startDelete(async () => {
         await deleteAccount();
         router.push('/');
      });
   }

   return (
      <div className='space-y-6'>
         {/* Sign out */}
         <div className='flex items-center justify-between'>
            <div>
               <p className='font-medium'>Đăng xuất</p>
               <p className='text-sm text-muted-foreground'>Đăng xuất khỏi tất cả thiết bị</p>
            </div>
            <Button
               variant='outline'
               onClick={handleSignOut}
               disabled={isSignOutPending}
            >
               {isSignOutPending && <Loader2 className='mr-2 size-4 animate-spin' />}
               Đăng xuất
            </Button>
         </div>

         {/* Delete account */}
         {!isDeleting ? (
            <div className='flex items-center justify-between'>
               <div>
                  <p className='font-medium text-destructive'>Xóa tài khoản</p>
                  <p className='text-sm text-muted-foreground'>Xóa vĩnh viễn tài khoản và tất cả dữ liệu</p>
               </div>
               <Button
                  variant='destructive'
                  onClick={() => setIsDeleting(true)}
               >
                  Xóa tài khoản
               </Button>
            </div>
         ) : (
            <div className='space-y-3 rounded-lg border border-destructive/50 p-4'>
               <div className='flex items-center gap-2 text-destructive'>
                  <AlertTriangle className='size-5' />
                  <p className='font-medium'>Hành động này không thể hoàn tác!</p>
               </div>
               <p className='text-sm text-muted-foreground'>
                  Nhập <span className='font-mono font-bold text-foreground'>{CONFIRM_WORD}</span> để xác nhận
               </p>
               <Input
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder={CONFIRM_WORD}
               />
               <div className='flex gap-2'>
                  <Button
                     variant='destructive'
                     onClick={handleDeleteAccount}
                     disabled={confirm !== CONFIRM_WORD || isDeletePending}
                  >
                     {isDeletePending && <Loader2 className='mr-2 size-4 animate-spin' />}
                     Xác nhận xóa
                  </Button>
                  <Button
                     variant='outline'
                     onClick={() => {
                        setIsDeleting(false);
                        setConfirm('');
                     }}
                  >
                     Hủy
                  </Button>
               </div>
            </div>
         )}
      </div>
   );
}
