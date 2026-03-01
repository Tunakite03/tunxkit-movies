import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Separator } from '@/components/ui/separator';
import { ProfileForm } from '@/components/account/profile-form';
import { PasswordForm } from '@/components/account/password-form';
import { DangerZone } from '@/components/account/danger-zone';

export const metadata: Metadata = { title: 'Tài khoản' };

export default async function AccountPage() {
   const session = await auth();
   if (!session?.user?.id) redirect('/sign-in');

   // Check if account was created via OAuth (no password)
   const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true, createdAt: true },
   });

   const isCredentials = !!user?.password;
   const avatarFallback = (session.user.name ?? session.user.email ?? 'U').charAt(0).toUpperCase();

   return (
      <div className='container mx-auto max-w-2xl px-4 py-10 md:px-6'>
         <h1 className='mb-8 text-3xl font-bold tracking-tight'>Tài khoản</h1>

         {/* Profile card */}
         <section className='mb-8 flex items-center gap-4 rounded-xl border border-border bg-card p-6'>
            <div className='flex size-16 shrink-0 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground'>
               {session.user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                     src={session.user.image}
                     alt={session.user.name ?? 'Avatar'}
                     className='size-16 rounded-full object-cover'
                  />
               ) : (
                  avatarFallback
               )}
            </div>
            <div>
               <p className='text-lg font-semibold'>{session.user.name ?? '(Chưa đặt tên)'}</p>
               <p className='text-sm text-muted-foreground'>{session.user.email}</p>
               <span className='mt-1 inline-block rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground'>
                  {isCredentials ? 'Email / Mật khẩu' : 'Google'}
               </span>
            </div>
         </section>

         {/* Edit name */}
         <section className='mb-8 rounded-xl border border-border bg-card p-6'>
            <h2 className='mb-4 text-lg font-semibold'>Thông tin cá nhân</h2>
            <ProfileForm defaultName={session.user.name ?? ''} />
         </section>

         <Separator className='my-8' />

         {/* Change password — credentials only */}
         {isCredentials && (
            <>
               <section className='mb-8 rounded-xl border border-border bg-card p-6'>
                  <h2 className='mb-4 text-lg font-semibold'>Đổi mật khẩu</h2>
                  <PasswordForm />
               </section>
               <Separator className='my-8' />
            </>
         )}

         {/* Danger zone */}
         <section className='rounded-xl border border-destructive/30 bg-card p-6'>
            <h2 className='mb-4 text-lg font-semibold text-destructive'>Vùng nguy hiểm</h2>
            <DangerZone />
         </section>
      </div>
   );
}
