import { Film } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { SITE_NAME } from '@/constants';

export function Footer() {
   const currentYear = new Date().getFullYear();

   return (
      <footer className='border-t border-border bg-background'>
         <div className='container mx-auto px-4 py-8 md:px-6'>
            <div className='flex flex-col items-center gap-4 text-center'>
               <div className='flex items-center gap-2'>
                  <Film className='size-5 text-primary' />
                  <span className='font-bold'>{SITE_NAME}</span>
               </div>
               <p className='max-w-md text-sm text-muted-foreground'>
                  Khám phá thế giới điện ảnh. Xem thông tin phim, trailer, đánh giá và nhiều hơn nữa.
               </p>
               <Separator className='my-2 max-w-xs' />
               <p className='text-xs text-muted-foreground'>
                  © {currentYear} {SITE_NAME}. Dữ liệu được cung cấp bởi{' '}
                  <a
                     href='https://www.themoviedb.org/'
                     target='_blank'
                     rel='noopener noreferrer'
                     className='font-medium text-primary hover:underline'
                  >
                     TMDB
                  </a>
                  .
               </p>
            </div>
         </div>
      </footer>
   );
}
