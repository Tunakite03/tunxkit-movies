import type { Metadata } from 'next';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { MovieGrid } from '@/components/movie-grid';
import { Pagination } from '@/components/pagination';
import { FilterBar } from '@/components/filter-bar';
import { fetchMoviesByCategory, discoverMovies } from '@/services';
import { CINEMA_CATEGORIES, DEFAULT_CINEMA_CATEGORY, SITE_URL } from '@/constants';
import type { MovieCategory, SortBy } from '@/types';

export const dynamic = 'force-dynamic';

interface CinemaPageProps {
   readonly searchParams: Promise<{
      category?: string;
      page?: string;
      year?: string;
      sort?: string;
      rating?: string;
   }>;
}

/** Validate category param against cinema categories (now_playing, upcoming) */
function isValidCinemaCategory(value: string | undefined): value is MovieCategory {
   return CINEMA_CATEGORIES.some((c) => c.value === value);
}

function hasActiveFilters(params: { year?: string; sort?: string; rating?: string }): boolean {
   return Boolean(
      params.year || (params.sort && params.sort !== 'popularity.desc') || params.rating,
   );
}

export async function generateMetadata({ searchParams }: CinemaPageProps): Promise<Metadata> {
   const { category } = await searchParams;
   const cat = isValidCinemaCategory(category) ? category : DEFAULT_CINEMA_CATEGORY;
   const label = CINEMA_CATEGORIES.find((c) => c.value === cat)?.label ?? 'Phim chiếu rạp';
   return {
      title: `${label} - Phim chiếu rạp`,
      description: `Danh sách phim chiếu rạp ${label.toLowerCase()} - Xem phim đang chiếu, phim sắp chiếu tại rạp.`,
      alternates: { canonical: `${SITE_URL}/cinema` },
   };
}

export default async function CinemaPage({ searchParams }: CinemaPageProps) {
   const params = await searchParams;
   const category = isValidCinemaCategory(params.category)
      ? params.category
      : DEFAULT_CINEMA_CATEGORY;
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
      <div className="container mx-auto space-y-6 px-4 py-8 md:px-6">
         <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Phim chiếu rạp</h1>

         {/* Category Tabs */}
         <div className="flex flex-wrap gap-2">
            {CINEMA_CATEGORIES.map((cat) => (
               <Button
                  key={cat.value}
                  variant={cat.value === category ? 'default' : 'outline'}
                  size="sm"
                  asChild
               >
                  <Link href={`/cinema?category=${cat.value}`} prefetch={false}>
                     {cat.label}
                  </Link>
               </Button>
            ))}
         </div>

         {/* Advanced Filters */}
         <FilterBar baseUrl="/cinema" preserveParams={{ category }} />

         {/* Movie Grid */}
         <MovieGrid movies={[...data.results]} />

         {/* Pagination */}
         <Pagination
            currentPage={page}
            totalPages={data.total_pages}
            baseUrl="/cinema"
            searchParams={filterSearchParams}
         />
      </div>
   );
}
