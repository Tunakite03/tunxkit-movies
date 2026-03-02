import type { ReactNode } from 'react';
import { Film } from 'lucide-react';
import Link from 'next/link';

import { SITE_NAME } from '@/constants';

export default function AuthLayout({ children }: { readonly children: ReactNode }) {
   return (
      <div className='flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12'>
         <Link
            href='/'
            className='mb-8 flex items-center gap-2 text-primary'
         >
            <Film className='size-7' />
            <span className='text-xl font-bold tracking-tight'>{SITE_NAME}</span>
         </Link>
         {children}
      </div>
   );
}
