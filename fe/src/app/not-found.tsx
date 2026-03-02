import Link from 'next/link';
import { FilmIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function NotFound() {
   return (
      <div className='container mx-auto flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center md:px-6'>
         <FilmIcon className='size-16 text-muted-foreground' />
         <h1 className='text-3xl font-bold'>404 - Không tìm thấy</h1>
         <p className='max-w-md text-muted-foreground'>Trang bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
         <Button asChild>
            <Link href='/'>Về trang chủ</Link>
         </Button>
      </div>
   );
}
