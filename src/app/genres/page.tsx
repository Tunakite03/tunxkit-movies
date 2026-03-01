import type { Metadata } from 'next';
import Link from 'next/link';
import { Film, Tv } from 'lucide-react';

import { fetchGenres, fetchTVGenres } from '@/services';
import { SITE_NAME } from '@/constants';

export const metadata: Metadata = {
   title: 'Thể loại phim',
   description: 'Khám phá phim theo thể loại - Hành động, kinh dị, lãng mạn, hoạt hình và nhiều hơn nữa.',
};

export default async function GenresPage() {
   const [movieGenres, tvGenres] = await Promise.all([fetchGenres(), fetchTVGenres()]);

   return (
      <div className='container mx-auto space-y-8 px-4 py-8 md:px-6'>
         <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>Thể loại</h1>

         {/* Movie Genres */}
         <section>
            <div className='mb-4 flex items-center gap-2'>
               <Film className='size-5 text-primary' />
               <h2 className='text-xl font-bold'>Thể loại phim lẻ</h2>
            </div>
            <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-4'>
               {movieGenres.map((genre) => (
                  <Link
                     key={genre.id}
                     href={`/genres/${genre.id}?type=movie`}
                     className='flex items-center justify-center rounded-lg border border-border bg-card p-4 text-center font-medium transition-all hover:border-primary/30 hover:bg-accent hover:shadow-md'
                  >
                     {genre.name}
                  </Link>
               ))}
            </div>
         </section>

         {/* TV Genres */}
         <section>
            <div className='mb-4 flex items-center gap-2'>
               <Tv className='size-5 text-primary' />
               <h2 className='text-xl font-bold'>Thể loại phim bộ</h2>
            </div>
            <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-4'>
               {tvGenres.map((genre) => (
                  <Link
                     key={genre.id}
                     href={`/genres/${genre.id}?type=tv`}
                     className='flex items-center justify-center rounded-lg border border-border bg-card p-4 text-center font-medium transition-all hover:border-primary/30 hover:bg-accent hover:shadow-md'
                  >
                     {genre.name}
                  </Link>
               ))}
            </div>
         </section>
      </div>
   );
}
