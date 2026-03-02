import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { WatchlistButton } from '@/components/watchlist-button';
import type { Movie } from '@/types';
import { getPosterUrl, formatRating, getYear } from '@/lib/image-utils';
import { movieToMediaItem } from '@/lib/image-utils';

interface MovieCardProps {
   readonly movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
   const year = getYear(movie.release_date);
   const rating = formatRating(movie.vote_average);
   const posterUrl = getPosterUrl(movie.poster_path, 'medium');

   return (
      <Link
         href={`/movies/${movie.id}`}
         className='group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all hover:shadow-lg hover:border-primary/30'
      >
         {/* Poster */}
         <div className='relative aspect-2/3 w-full overflow-hidden bg-muted'>
            <Image
               src={posterUrl}
               alt={movie.title}
               fill
               sizes='(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw'
               className='object-cover transition-transform duration-300 group-hover:scale-105'
            />

            {/* Rating Badge */}
            {movie.vote_average > 0 && (
               <Badge
                  variant='secondary'
                  className='absolute right-2 top-2 gap-1 bg-background/80 backdrop-blur-sm'
               >
                  <Star className='size-3 fill-primary text-primary' />
                  <span className='text-xs font-semibold'>{rating}</span>
               </Badge>
            )}

            {/* Watchlist Button */}
            <div className='absolute bottom-2 right-2 opacity-0 transition-opacity group-hover:opacity-100'>
               <WatchlistButton item={movieToMediaItem(movie)} />
            </div>
         </div>

         {/* Info */}
         <div className='flex flex-1 flex-col gap-1 p-3'>
            <h3 className='line-clamp-2 text-sm font-semibold leading-tight group-hover:text-primary transition-colors'>
               {movie.title}
            </h3>
            {year !== 'N/A' && <p className='text-xs text-muted-foreground'>{year}</p>}
         </div>
      </Link>
   );
}
