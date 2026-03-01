'use client';

import { Heart, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { MediaCard } from '@/components/media-card';
import { useWatchlist } from '@/store/watchlist-context';

export default function WatchlistPage() {
   const { items, clearWatchlist, count } = useWatchlist();

   return (
      <div className='container mx-auto px-4 py-8 md:px-6'>
         {/* Header */}
         <div className='mb-8 flex items-center justify-between'>
            <div>
               <h1 className='text-3xl font-bold'>Yêu thích</h1>
               <p className='mt-1 text-muted-foreground'>
                  {count > 0 ? `${count} phim trong danh sách` : 'Chưa có phim nào'}
               </p>
            </div>
            {count > 0 && (
               <Button
                  variant='outline'
                  size='sm'
                  onClick={clearWatchlist}
               >
                  <Trash2 className='mr-2 size-4' />
                  Xóa tất cả
               </Button>
            )}
         </div>

         {/* Content */}
         {count === 0 ? (
            <div className='flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center'>
               <div className='flex size-16 items-center justify-center rounded-full bg-muted'>
                  <Heart className='size-8 text-muted-foreground' />
               </div>
               <div className='space-y-2'>
                  <h2 className='text-xl font-semibold'>Danh sách trống</h2>
                  <p className='max-w-md text-muted-foreground'>
                     Nhấn vào biểu tượng trái tim trên các phim để thêm vào danh sách yêu thích.
                  </p>
               </div>
            </div>
         ) : (
            <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'>
               {items.map((item) => (
                  <MediaCard
                     key={`${item.mediaType}-${item.id}`}
                     item={item}
                  />
               ))}
            </div>
         )}
      </div>
   );
}
