'use client';

import { useEffect } from 'react';
import { Film, RotateCcw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

interface ErrorPageProps {
   readonly error: Error & { digest?: string };
   readonly reset: () => void;
}

export default function MovieDetailError({ error, reset }: ErrorPageProps) {
   useEffect(() => {
      console.error('Movie detail error:', error);
   }, [error]);

   return (
      <div className='flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center'>
         <div className='flex size-16 items-center justify-center rounded-full bg-destructive/10'>
            <Film className='size-8 text-destructive' />
         </div>
         <div className='space-y-2'>
            <h1 className='text-2xl font-bold'>Không thể tải thông tin phim</h1>
            <p className='max-w-md text-muted-foreground'>
               Phim này có thể không tồn tại hoặc đã bị xóa. Vui lòng thử lại.
            </p>
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
               <Link href='/movies'>
                  <ArrowLeft className='mr-2 size-4' />
                  Danh sách phim
               </Link>
            </Button>
         </div>
      </div>
   );
}
