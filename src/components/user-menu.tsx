'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { User, LogOut, Settings, Loader2 } from 'lucide-react';
import { useTransition } from 'react';

import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { signOutAction } from '@/actions/auth-actions';

export function UserMenu() {
   const { data: session, status } = useSession();
   const [isPending, startTransition] = useTransition();

   if (status === 'loading') {
      return <div className='size-8 animate-pulse rounded-full bg-muted' />;
   }

   if (!session) {
      return (
         <Button
            asChild
            size='sm'
         >
            <Link href='/sign-in'>Đăng nhập</Link>
         </Button>
      );
   }

   const name = session.user.name ?? '';
   const email = session.user.email ?? '';
   const fallback = (name || email).charAt(0).toUpperCase() || 'U';

   function handleSignOut() {
      startTransition(async () => {
         await signOutAction();
      });
   }

   return (
      <DropdownMenu>
         <DropdownMenuTrigger asChild>
            <button
               className='rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
               aria-label='Menu tài khoản'
               disabled={isPending}
            >
               {isPending ? (
                  <div className='flex size-8 items-center justify-center rounded-full bg-muted'>
                     <Loader2 className='size-4 animate-spin' />
                  </div>
               ) : (
                  <Avatar className='size-8'>
                     <AvatarImage
                        src={session.user.image ?? undefined}
                        alt={name || 'Avatar'}
                     />
                     <AvatarFallback className='bg-primary text-primary-foreground text-xs font-semibold'>
                        {fallback}
                     </AvatarFallback>
                  </Avatar>
               )}
            </button>
         </DropdownMenuTrigger>

         <DropdownMenuContent
            align='end'
            className='w-52'
         >
            <DropdownMenuLabel className='font-normal'>
               <p className='font-medium'>{name || '(Chưa đặt tên)'}</p>
               <p className='text-xs text-muted-foreground truncate'>{email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
               <Link
                  href='/account'
                  className='cursor-pointer'
               >
                  <Settings className='mr-2 size-4' />
                  Tài khoản
               </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
               <Link
                  href='/watchlist'
                  className='cursor-pointer'
               >
                  <User className='mr-2 size-4' />
                  Yêu thích
               </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
               className='text-destructive focus:text-destructive cursor-pointer'
               onClick={handleSignOut}
            >
               <LogOut className='mr-2 size-4' />
               Đăng xuất
            </DropdownMenuItem>
         </DropdownMenuContent>
      </DropdownMenu>
   );
}
