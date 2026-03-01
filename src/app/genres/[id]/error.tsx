'use client';

import { useEffect } from 'react';
import { LayoutGrid, RotateCcw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

interface ErrorPageProps {
   readonly error: Error & { digest?: string };
   readonly reset: () => void;
}

export default function GenreDetailError({ error, reset }: ErrorPageProps) {
   useEffect(() => {
      console.error('Genre detail error:', error);
   }, [error]);

   return (
      <div className='flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center'>
         <div className='flex size-16 items-center justify-center rounded-full bg-destructive/10'>
            <LayoutGrid className='size-8 text-destructive' />
         </div>
         <div className='space-y-2'>
            <h1 className='text-2xl font-bold'>Không thể tải thể loại này</h1>
            <p className='max-w-md text-muted-foreground'>
               Thể loại không tồn tại hoặc có lỗi khi tải dữ liệu. Vui lòng thử lại.
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
               <Link href='/genres'>
                  <ArrowLeft className='mr-2 size-4' />
                  Tất cả thể loại
               </Link>
            </Button>
         </div>
      </div>
   );
}
