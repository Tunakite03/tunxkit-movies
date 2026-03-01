import { Badge } from '@/components/ui/badge';
import type { Genre } from '@/types';

interface GenreBadgeProps {
   readonly genre: Genre;
}

export function GenreBadge({ genre }: GenreBadgeProps) {
   return (
      <Badge
         variant='outline'
         className='text-xs'
      >
         {genre.name}
      </Badge>
   );
}

interface GenreBadgeListProps {
   readonly genres: readonly Genre[];
}

export function GenreBadgeList({ genres }: GenreBadgeListProps) {
   if (genres.length === 0) return null;

   return (
      <div className='flex flex-wrap gap-2'>
         {genres.map((genre) => (
            <GenreBadge
               key={genre.id}
               genre={genre}
            />
         ))}
      </div>
   );
}
