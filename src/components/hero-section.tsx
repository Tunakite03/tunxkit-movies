import Image from 'next/image';
import Link from 'next/link';
import { Play, Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Movie } from '@/types';
import { getBackdropUrl, formatRating, getYear } from '@/lib/image-utils';

interface HeroSectionProps {
   readonly movie: Movie;
}

export function HeroSection({ movie }: HeroSectionProps) {
   const backdropUrl = getBackdropUrl(movie.backdrop_path, 'original');
   const year = getYear(movie.release_date);
   const rating = formatRating(movie.vote_average);

   return (
      <section className='relative h-[60vh] min-h-[400px] w-full overflow-hidden md:h-[70vh]'>
         {/* Backdrop Image */}
         <div className='absolute inset-0'>
            <Image
               src={backdropUrl}
               alt={movie.title}
               fill
               priority
               sizes='100vw'
               className='object-cover'
            />
            {/* Gradient Overlays */}
            <div className='absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent' />
            <div className='absolute inset-0 bg-linear-to-r from-background/80 to-transparent' />
         </div>

         {/* Content */}
         <div className='container relative mx-auto flex h-full items-end px-4 pb-12 md:px-6 md:pb-16'>
            <div className='max-w-2xl space-y-4'>
               <div className='flex items-center gap-2'>
                  <Badge
                     variant='default'
                     className='gap-1'
                  >
                     <Star className='size-3 fill-primary-foreground' />
                     {rating}
                  </Badge>
                  {year !== 'N/A' && <Badge variant='secondary'>{year}</Badge>}
               </div>

               <h1 className='text-3xl font-bold tracking-tight md:text-5xl'>{movie.title}</h1>

               <p className='line-clamp-3 text-sm text-muted-foreground md:text-base'>{movie.overview}</p>

               <div className='flex gap-3'>
                  <Button asChild>
                     <Link
                        href={`/movies/${movie.id}/watch`}
                        className='gap-2'
                     >
                        <Play className='size-4 fill-current' />
                        Xem phim
                     </Link>
                  </Button>
                  <Button
                     variant='outline'
                     asChild
                  >
                     <Link href={`/movies/${movie.id}`}>Xem chi tiết</Link>
                  </Button>
               </div>
            </div>
         </div>
      </section>
   );
}
