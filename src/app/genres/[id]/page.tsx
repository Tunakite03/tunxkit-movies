import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { MediaGrid } from '@/components/media-grid';
import { Pagination } from '@/components/pagination';
import { fetchMoviesByGenre, fetchTVByGenre, fetchGenres, fetchTVGenres } from '@/services';
import { movieToMediaItem, tvShowToMediaItem } from '@/lib/image-utils';
import { SITE_NAME, SITE_URL } from '@/constants';

type MediaType = 'movie' | 'tv';

interface GenreDetailPageProps {
   readonly params: Promise<{ id: string }>;
   readonly searchParams: Promise<{ type?: string; page?: string }>;
}

function isValidMediaType(value: string | undefined): value is MediaType {
   return value === 'movie' || value === 'tv';
}

export async function generateMetadata({ params, searchParams }: GenreDetailPageProps): Promise<Metadata> {
   const { id } = await params;
   const { type } = await searchParams;
   const genreId = Number(id);
   if (Number.isNaN(genreId)) return { title: 'Thể loại không tìm thấy' };

   const mediaType = isValidMediaType(type) ? type : 'movie';
   const genres = mediaType === 'tv' ? await fetchTVGenres() : await fetchGenres();
   const genre = genres.find((g) => g.id === genreId);

   return {
      title: genre ? `${genre.name} - Thể loại` : 'Thể loại',
      description: genre ? `Phim thể loại ${genre.name} - Danh sách phim hay nhất.` : 'Phim theo thể loại',
      alternates: genre ? { canonical: `${SITE_URL}/genres/${genre.id}?type=${mediaType}` } : undefined,
   };
}

export default async function GenreDetailPage({ params, searchParams }: GenreDetailPageProps) {
   const { id } = await params;
   const { type: typeParam, page: pageParam } = await searchParams;
   const genreId = Number(id);
   if (Number.isNaN(genreId)) notFound();

   const mediaType = isValidMediaType(typeParam) ? typeParam : 'movie';
   const page = Math.max(1, Number(pageParam) || 1);

   const [genres, data] = await Promise.all([
      mediaType === 'tv' ? fetchTVGenres() : fetchGenres(),
      mediaType === 'tv' ? fetchTVByGenre(genreId, page) : fetchMoviesByGenre(genreId, page),
   ]);

   const genre = genres.find((g) => g.id === genreId);
   if (!genre) notFound();

   const items =
      mediaType === 'tv'
         ? data.results.map((item) => tvShowToMediaItem(item as Parameters<typeof tvShowToMediaItem>[0]))
         : data.results.map((item) => movieToMediaItem(item as Parameters<typeof movieToMediaItem>[0]));

   const typeLabel = mediaType === 'tv' ? 'Phim bộ' : 'Phim lẻ';

   return (
      <div className='container mx-auto space-y-6 px-4 py-8 md:px-6'>
         <div>
            <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>{genre.name}</h1>
            <p className='mt-1 text-muted-foreground'>
               {typeLabel} thể loại {genre.name}
            </p>
         </div>

         {/* Toggle Movie / TV */}
         <div className='flex gap-2'>
            <Button
               variant={mediaType === 'movie' ? 'default' : 'outline'}
               size='sm'
               asChild
            >
               <Link
                  href={`/genres/${genreId}?type=movie`}
                  prefetch={false}
               >
                  Phim lẻ
               </Link>
            </Button>
            <Button
               variant={mediaType === 'tv' ? 'default' : 'outline'}
               size='sm'
               asChild
            >
               <Link
                  href={`/genres/${genreId}?type=tv`}
                  prefetch={false}
               >
                  Phim bộ
               </Link>
            </Button>
         </div>

         <MediaGrid items={items} />

         <Pagination
            currentPage={page}
            totalPages={data.total_pages}
            baseUrl={`/genres/${genreId}`}
            searchParams={{ type: mediaType }}
         />
      </div>
   );
}
