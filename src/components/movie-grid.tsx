import type { Movie } from '@/types';
import { MovieCard } from './movie-card';

interface MovieGridProps {
   readonly movies: readonly Movie[];
   readonly title?: string;
}

export function MovieGrid({ movies, title }: MovieGridProps) {
   if (movies.length === 0) {
      return (
         <div className='flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-border'>
            <p className='text-muted-foreground'>Không tìm thấy phim nào.</p>
         </div>
      );
   }

   return (
      <section>
         {title && <h2 className='mb-4 text-xl font-bold tracking-tight md:text-2xl'>{title}</h2>}
         <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-4'>
            {movies.map((movie) => (
               <MovieCard
                  key={movie.id}
                  movie={movie}
               />
            ))}
         </div>
      </section>
   );
}
