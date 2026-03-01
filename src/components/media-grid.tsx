import type { MediaItem } from '@/types';
import { MediaCard } from './media-card';

interface MediaGridProps {
   readonly items: readonly MediaItem[];
   readonly title?: string;
   readonly emptyMessage?: string;
}

/** Shared grid component for movies and TV shows */
export function MediaGrid({ items, title, emptyMessage = 'Không tìm thấy kết quả nào.' }: MediaGridProps) {
   if (items.length === 0) {
      return (
         <div className='flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-border'>
            <p className='text-muted-foreground'>{emptyMessage}</p>
         </div>
      );
   }

   return (
      <section>
         {title && <h2 className='mb-4 text-xl font-bold tracking-tight md:text-2xl'>{title}</h2>}
         <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-4'>
            {items.map((item) => (
               <MediaCard
                  key={`${item.mediaType}-${item.id}`}
                  item={item}
               />
            ))}
         </div>
      </section>
   );
}
