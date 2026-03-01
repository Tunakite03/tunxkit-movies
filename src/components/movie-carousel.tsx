import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

import type { Movie } from '@/types';
import { MovieCard } from './movie-card';
import { Button } from '@/components/ui/button';

interface MovieCarouselProps {
   readonly movies: readonly Movie[];
   readonly title: string;
   readonly href?: string;
}

export function MovieCarousel({ movies, title, href }: MovieCarouselProps) {
   if (movies.length === 0) return null;

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
            {movies.map((movie) => (
               <div
                  key={movie.id}
                  className='w-[160px] shrink-0 md:w-[200px]'
               >
                  <MovieCard movie={movie} />
               </div>
            ))}
         </div>
      </section>
   );
}
