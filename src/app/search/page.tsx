import type { Metadata } from 'next';
import { Search } from 'lucide-react';

import { MediaGrid } from '@/components/media-grid';
import { Pagination } from '@/components/pagination';
import { searchMovies, searchTV } from '@/services';
import { movieToMediaItem, tvShowToMediaItem } from '@/lib/image-utils';
import { SITE_NAME, SITE_URL } from '@/constants';

interface SearchPageProps {
   readonly searchParams: Promise<{ q?: string; page?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
   const { q } = await searchParams;
   const title = q ? `Kết quả tìm kiếm: "${q}"` : 'Tìm kiếm phim';
   return {
      title,
      description: q ? `Kết quả tìm kiếm cho "${q}" trên ${SITE_NAME}` : 'Tìm kiếm phim lẻ, phim bộ theo tên.',
      alternates: { canonical: `${SITE_URL}/search` },
      robots: { index: false, follow: true },
   };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
   const { q, page: pageParam } = await searchParams;
   const page = Math.max(1, Number(pageParam) || 1);

   // No search query
   if (!q?.trim()) {
      return (
         <div className='container mx-auto px-4 py-12 md:px-6'>
            <div className='flex min-h-[400px] flex-col items-center justify-center gap-4 text-center'>
               <Search className='size-12 text-muted-foreground' />
               <h1 className='text-2xl font-bold'>Tìm kiếm phim</h1>
               <p className='max-w-md text-muted-foreground'>
                  Nhập tên phim vào thanh tìm kiếm phía trên để bắt đầu tìm kiếm.
               </p>
            </div>
         </div>
      );
   }

   const [movieResults, tvResults] = await Promise.all([searchMovies(q, page), searchTV(q, page)]);

   const movieItems = movieResults.results.map(movieToMediaItem);
   const tvItems = tvResults.results.map(tvShowToMediaItem);
   const allItems = [...movieItems, ...tvItems].sort((a, b) => b.voteAverage - a.voteAverage);
   const totalResults = movieResults.total_results + tvResults.total_results;
   const totalPages = Math.max(movieResults.total_pages, tvResults.total_pages);

   return (
      <div className='container mx-auto space-y-6 px-4 py-8 md:px-6'>
         <div>
            <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>Kết quả tìm kiếm</h1>
            <p className='mt-1 text-muted-foreground'>
               Tìm thấy <span className='font-semibold text-foreground'>{totalResults.toLocaleString()}</span> kết quả
               cho &ldquo;{q}&rdquo;
            </p>
         </div>

         <MediaGrid
            items={allItems}
            emptyMessage='Không tìm thấy kết quả nào.'
         />

         <Pagination
            currentPage={page}
            totalPages={totalPages}
            baseUrl='/search'
            searchParams={{ q }}
         />
      </div>
   );
}
