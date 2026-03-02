'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

import { useAuthStore } from '@/store/auth-store';
import { Separator } from '@/components/ui/separator';
import { ProfileForm } from '@/components/account/profile-form';
import { PasswordForm } from '@/components/account/password-form';
import { DangerZone } from '@/components/account/danger-zone';

export default function AccountPage() {
   const { user, isAuthenticated, isHydrated } = useAuthStore();
   const router = useRouter();

   useEffect(() => {
      if (isHydrated && !isAuthenticated) {
         router.replace('/sign-in');
      }
   }, [isHydrated, isAuthenticated, router]);

   if (!isHydrated) {
      return (
         <div className='flex min-h-[50vh] items-center justify-center'>
            <Loader2 className='size-8 animate-spin text-muted-foreground' />
         </div>
      );
   }

   if (!isAuthenticated || !user) return null;

   const avatarFallback = (user.name ?? user.email ?? 'U').charAt(0).toUpperCase();

   return (
      <div className='container mx-auto max-w-2xl px-4 py-10 md:px-6'>
         <h1 className='mb-8 text-3xl font-bold tracking-tight'>Tài khoản</h1>

         {/* Profile card */}
         <section className='mb-8 flex items-center gap-4 rounded-xl border border-border bg-card p-6'>
            <div className='flex size-16 shrink-0 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground'>
               {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                     src={user.image}
                     alt={user.name ?? 'Avatar'}
                     className='size-16 rounded-full object-cover'
                  />
               ) : (
                  avatarFallback
               )}
            </div>
            <div>
               <p className='text-lg font-semibold'>{user.name ?? '(Chưa đặt tên)'}</p>
               <p className='text-sm text-muted-foreground'>{user.email}</p>
               <span className='mt-1 inline-block rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground'>
                  Email / Mật khẩu
               </span>
            </div>
         </section>

         {/* Edit name */}
         <section className='mb-8 rounded-xl border border-border bg-card p-6'>
            <h2 className='mb-4 text-lg font-semibold'>Thông tin cá nhân</h2>
            <ProfileForm defaultName={user.name ?? ''} />
         </section>

         <Separator className='my-8' />

         {/* Change password */}
         <section className='mb-8 rounded-xl border border-border bg-card p-6'>
            <h2 className='mb-4 text-lg font-semibold'>Đổi mật khẩu</h2>
            <PasswordForm />
         </section>

         <Separator className='my-8' />

         {/* Danger zone */}
         <section className='rounded-xl border border-destructive/30 bg-card p-6'>
            <h2 className='mb-4 text-lg font-semibold text-destructive'>Vùng nguy hiểm</h2>
            <DangerZone />
         </section>
      </div>
   );
}
