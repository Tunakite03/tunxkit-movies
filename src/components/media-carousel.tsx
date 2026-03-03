'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronLeft } from 'lucide-react';

import type { MediaItem } from '@/types';
import { MediaCard } from './media-card';
import { Button } from '@/components/ui/button';

const SCROLL_AMOUNT = 600;

interface MediaCarouselProps {
   readonly items: readonly MediaItem[];
   readonly title: string;
   readonly href?: string;
}

/** Shared horizontal carousel for movies and TV shows */
export function MediaCarousel({ items, title, href }: MediaCarouselProps) {
   const scrollRef = useRef<HTMLDivElement>(null);
   const [canScrollLeft, setCanScrollLeft] = useState(false);
   const [canScrollRight, setCanScrollRight] = useState(false);

   const updateScrollState = useCallback(() => {
      const el = scrollRef.current;
      if (!el) return;
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
   }, []);

   useEffect(() => {
      updateScrollState();
      const el = scrollRef.current;
      // Re-check after layout in case items aren't rendered yet
      const raf = requestAnimationFrame(updateScrollState);
      el?.addEventListener('scroll', updateScrollState, { passive: true });
      return () => {
         cancelAnimationFrame(raf);
         el?.removeEventListener('scroll', updateScrollState);
      };
   }, [updateScrollState, items]);

   const handleScrollLeft = useCallback(() => {
      scrollRef.current?.scrollBy({ left: -SCROLL_AMOUNT, behavior: 'smooth' });
   }, []);

   const handleScrollRight = useCallback(() => {
      scrollRef.current?.scrollBy({ left: SCROLL_AMOUNT, behavior: 'smooth' });
   }, []);

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
         <div className='relative'>
            {canScrollLeft && (
               <div className='pointer-events-none absolute inset-y-0 left-0 z-10 flex w-20 items-center bg-linear-to-r from-background to-transparent'>
                  <Button
                     variant='default'
                     size='icon'
                     onClick={handleScrollLeft}
                     className='pointer-events-auto ml-1 size-8 rounded-full shadow-md'
                     aria-label='Cuộn trái'
                  >
                     <ChevronLeft className='size-4' />
                  </Button>
               </div>
            )}
            <div
               ref={scrollRef}
               className='flex gap-3 overflow-x-auto pb-4 scrollbar-thin md:gap-4'
            >
               {items.map((item) => (
                  <div
                     key={`${item.mediaType}-${item.id}`}
                     className='w-[160px] shrink-0 md:w-[200px]'
                  >
                     <MediaCard item={item} />
                  </div>
               ))}
            </div>
            {canScrollRight && (
               <div className='pointer-events-none absolute inset-y-0 right-0 z-10 flex w-20 items-center justify-end bg-linear-to-l from-background to-transparent'>
                  <Button
                     variant='default'
                     size='icon'
                     onClick={handleScrollRight}
                     className='pointer-events-auto mr-1 size-8 rounded-full shadow-md'
                     aria-label='Cuộn phải'
                  >
                     <ChevronRight className='size-4' />
                  </Button>
               </div>
            )}
         </div>
      </section>
   );
}
