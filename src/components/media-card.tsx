import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { WatchlistButton } from '@/components/watchlist-button';
import type { MediaItem } from '@/types';
import { getPosterUrl, formatRating, getYear } from '@/lib/image-utils';

interface MediaCardProps {
   readonly item: MediaItem;
}

/** Shared card component for movies and TV shows */
export function MediaCard({ item }: MediaCardProps) {
   const year = getYear(item.releaseDate);
   const rating = formatRating(item.voteAverage);
   const posterUrl = getPosterUrl(item.posterPath, 'medium');
   const href = item.mediaType === 'tv' ? `/tv/${item.id}` : `/movies/${item.id}`;

   return (
      <Link
         href={href}
         className='group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all hover:shadow-lg hover:border-primary/30'
      >
         {/* Poster */}
         <div className='relative aspect-2/3 w-full overflow-hidden bg-muted'>
            <Image
               src={posterUrl}
               alt={item.title}
               fill
               sizes='(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw'
               className='object-cover transition-transform duration-300 group-hover:scale-105'
            />

            {/* Rating Badge */}
            {item.voteAverage > 0 && (
               <Badge
                  variant='secondary'
                  className='absolute right-2 top-2 gap-1 bg-background/80 backdrop-blur-sm'
               >
                  <Star className='size-3 fill-primary text-primary' />
                  <span className='text-xs font-semibold'>{rating}</span>
               </Badge>
            )}

            {/* Media Type Badge */}
            <Badge
               variant='default'
               className='absolute left-2 top-2 text-[10px]'
            >
               {item.mediaType === 'tv' ? 'TV' : 'Phim'}
            </Badge>

            {/* Watchlist Button */}
            <div className='absolute bottom-2 right-2 opacity-0 transition-opacity group-hover:opacity-100'>
               <WatchlistButton item={item} />
            </div>
         </div>

         {/* Info */}
         <div className='flex flex-1 flex-col gap-1 p-3'>
            <h3 className='line-clamp-2 text-sm font-semibold leading-tight group-hover:text-primary transition-colors'>
               {item.title}
            </h3>
            {year !== 'N/A' && <p className='text-xs text-muted-foreground'>{year}</p>}
         </div>
      </Link>
   );
}
