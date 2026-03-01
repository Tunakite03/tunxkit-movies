import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
   readonly rating: number;
   readonly maxRating?: number;
   readonly className?: string;
}

/**
 * Display a star rating (out of 10 from TMDB, shown as out of 5).
 */
export function StarRating({ rating, maxRating = 10, className }: StarRatingProps) {
   const normalizedRating = (rating / maxRating) * 5;
   const fullStars = Math.floor(normalizedRating);
   const hasHalfStar = normalizedRating - fullStars >= 0.5;
   const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

   return (
      <div className={cn('flex items-center gap-0.5', className)}>
         {Array.from({ length: fullStars }, (_, i) => (
            <Star
               key={`full-${i}`}
               className='size-4 fill-primary text-primary'
            />
         ))}
         {hasHalfStar && (
            <Star
               key='half'
               className='size-4 fill-primary/50 text-primary'
            />
         )}
         {Array.from({ length: emptyStars }, (_, i) => (
            <Star
               key={`empty-${i}`}
               className='size-4 text-muted-foreground/30'
            />
         ))}
      </div>
   );
}
