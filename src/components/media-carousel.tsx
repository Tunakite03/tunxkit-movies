import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

import type { MediaItem } from '@/types';
import { MediaCard } from './media-card';
import { Button } from '@/components/ui/button';

interface MediaCarouselProps {
   readonly items: readonly MediaItem[];
   readonly title: string;
   readonly href?: string;
}

/** Shared horizontal carousel for movies and TV shows */
export function MediaCarousel({ items, title, href }: MediaCarouselProps) {
   if (items.length === 0) return null;

   return (
      <section>
         <div className='mb-4 flex items-center justify-between'>
            <h2 className='text-xl font-bold tracking-tight md:text-2xl'>{title}</h2>
            {href && (
               <Button
                  variant='ghost'
                  size='sm'
                  asChild
               >
                  <Link
                     href={href}
                     className='gap-1'
                  >
                     Xem tất cả
                     <ChevronRight className='size-4' />
                  </Link>
               </Button>
            )}
         </div>
         <div className='flex gap-3 overflow-x-auto pb-4 scrollbar-thin md:gap-4'>
            {items.map((item) => (
               <div
                  key={`${item.mediaType}-${item.id}`}
                  className='w-[160px] shrink-0 md:w-[200px]'
               >
                  <MediaCard item={item} />
               </div>
            ))}
         </div>
      </section>
   );
}
