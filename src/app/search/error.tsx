'use client';

import { useEffect } from 'react';
import { Search, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

interface ErrorPageProps {
   readonly error: Error & { digest?: string };
   readonly reset: () => void;
}

export default function SearchError({ error, reset }: ErrorPageProps) {
   useEffect(() => {
      console.error('Search error:', error);
   }, [error]);

   return (
      <div className='flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center'>
         <div className='flex size-16 items-center justify-center rounded-full bg-destructive/10'>
            <Search className='size-8 text-destructive' />
         </div>
         <div className='space-y-2'>
            <h1 className='text-2xl font-bold'>Lỗi tìm kiếm</h1>
            <p className='max-w-md text-muted-foreground'>Không thể thực hiện tìm kiếm. Vui lòng thử lại sau.</p>
         </div>
         <div className='flex items-center gap-3'>
            <Button
               onClick={reset}
               variant='default'
            >
               <RotateCcw className='mr-2 size-4' />
               Thử lại
            </Button>
            <Button
               variant='outline'
               asChild
            >
               <Link href='/'>
                  <Home className='mr-2 size-4' />
                  Trang chủ
               </Link>
            </Button>
         </div>
      </div>
   );
}
