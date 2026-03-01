import type { Metadata } from 'next';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { MovieGrid } from '@/components/movie-grid';
import { Pagination } from '@/components/pagination';
import { FilterBar } from '@/components/filter-bar';
import { fetchMoviesByCategory, discoverMovies } from '@/services';
import { MOVIE_CATEGORIES, DEFAULT_CATEGORY, SITE_URL } from '@/constants';
import type { MovieCategory, SortBy } from '@/types';

interface MoviesPageProps {
   readonly searchParams: Promise<{
      category?: string;
      page?: string;
      year?: string;
      sort?: string;
      rating?: string;
   }>;
}

/** Validate category param against known categories */
function isValidCategory(value: string | undefined): value is MovieCategory {
   return MOVIE_CATEGORIES.some((c) => c.value === value);
}

function hasActiveFilters(params: { year?: string; sort?: string; rating?: string }): boolean {
   return Boolean(params.year || (params.sort && params.sort !== 'popularity.desc') || params.rating);
}

export async function generateMetadata({ searchParams }: MoviesPageProps): Promise<Metadata> {
   const { category } = await searchParams;
   const cat = isValidCategory(category) ? category : DEFAULT_CATEGORY;
   const label = MOVIE_CATEGORIES.find((c) => c.value === cat)?.label ?? 'Phim';
   return {
      title: `${label} - Phim`,
      description: `Danh sách phim ${label.toLowerCase()} - Xem phim mới nhất, phim hay nhất.`,
      alternates: { canonical: `${SITE_URL}/movies` },
   };
}

export default async function MoviesPage({ searchParams }: MoviesPageProps) {
   const params = await searchParams;
   const category = isValidCategory(params.category) ? params.category : DEFAULT_CATEGORY;
   const page = Math.max(1, Number(params.page) || 1);

   const useDiscover = hasActiveFilters(params);

   const data = useDiscover
      ? await discoverMovies(
           {
              year: params.year ? Number(params.year) : undefined,
              sortBy: (params.sort as SortBy) || 'popularity.desc',
              minRating: params.rating ? Number(params.rating) : undefined,
           },
           page,
        )
      : await fetchMoviesByCategory(category, page);

   const filterSearchParams: Record<string, string> = { category };
   if (params.year) filterSearchParams.year = params.year;
   if (params.sort) filterSearchParams.sort = params.sort;
   if (params.rating) filterSearchParams.rating = params.rating;

   return (
      <div className='container mx-auto space-y-6 px-4 py-8 md:px-6'>
         {/* Title */}
         <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>Khám phá phim</h1>

         {/* Category Tabs */}
         <div className='flex flex-wrap gap-2'>
            {MOVIE_CATEGORIES.map((cat) => (
               <Button
                  key={cat.value}
                  variant={cat.value === category ? 'default' : 'outline'}
                  size='sm'
                  asChild
               >
                  <Link
                     href={`/movies?category=${cat.value}`}
                     prefetch={false}
                  >
                     {cat.label}
                  </Link>
               </Button>
            ))}
         </div>

         {/* Advanced Filters */}
         <FilterBar
            baseUrl='/movies'
            preserveParams={{ category }}
         />

         {/* Movie Grid */}
         <MovieGrid movies={[...data.results]} />

         {/* Pagination */}
         <Pagination
            currentPage={page}
            totalPages={data.total_pages}
            baseUrl='/movies'
            searchParams={filterSearchParams}
         />
      </div>
   );
}
