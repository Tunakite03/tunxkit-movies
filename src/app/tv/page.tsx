import type { Metadata } from 'next';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { MediaGrid } from '@/components/media-grid';
import { Pagination } from '@/components/pagination';
import { FilterBar } from '@/components/filter-bar';
import { fetchTVByCategory, discoverTV } from '@/services';
import { tvShowToMediaItem } from '@/lib/image-utils';
import { TV_CATEGORIES, DEFAULT_TV_CATEGORY, SITE_URL } from '@/constants';
import type { TVCategory, SortBy } from '@/types';

interface TVPageProps {
   readonly searchParams: Promise<{
      category?: string;
      page?: string;
      year?: string;
      sort?: string;
      rating?: string;
   }>;
}

/** Validate category param against known TV categories */
function isValidCategory(value: string | undefined): value is TVCategory {
   return TV_CATEGORIES.some((c) => c.value === value);
}

function hasActiveFilters(params: { year?: string; sort?: string; rating?: string }): boolean {
   return Boolean(params.year || (params.sort && params.sort !== 'popularity.desc') || params.rating);
}

export async function generateMetadata({ searchParams }: TVPageProps): Promise<Metadata> {
   const { category } = await searchParams;
   const cat = isValidCategory(category) ? category : DEFAULT_TV_CATEGORY;
   const label = TV_CATEGORIES.find((c) => c.value === cat)?.label ?? 'Phim bộ';
   return {
      title: `${label} - Phim bộ`,
      description: `Danh sách phim bộ ${label.toLowerCase()} - Xem phim bộ mới nhất, phim bộ hay nhất.`,
      alternates: { canonical: `${SITE_URL}/tv` },
   };
}

export default async function TVPage({ searchParams }: TVPageProps) {
   const params = await searchParams;
   const category = isValidCategory(params.category) ? params.category : DEFAULT_TV_CATEGORY;
   const page = Math.max(1, Number(params.page) || 1);

   const useDiscover = hasActiveFilters(params);

   const data = useDiscover
      ? await discoverTV(
           {
              year: params.year ? Number(params.year) : undefined,
              sortBy: (params.sort as SortBy) || 'popularity.desc',
              minRating: params.rating ? Number(params.rating) : undefined,
           },
           page,
        )
      : await fetchTVByCategory(category, page);

   const items = data.results.map(tvShowToMediaItem);

   const filterSearchParams: Record<string, string> = { category };
   if (params.year) filterSearchParams.year = params.year;
   if (params.sort) filterSearchParams.sort = params.sort;
   if (params.rating) filterSearchParams.rating = params.rating;

   return (
      <div className='container mx-auto space-y-6 px-4 py-8 md:px-6'>
         <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>Phim bộ</h1>

         {/* Category Tabs */}
         <div className='flex flex-wrap gap-2'>
            {TV_CATEGORIES.map((cat) => (
               <Button
                  key={cat.value}
                  variant={cat.value === category ? 'default' : 'outline'}
                  size='sm'
                  asChild
               >
                  <Link
                     href={`/tv?category=${cat.value}`}
                     prefetch={false}
                  >
                     {cat.label}
                  </Link>
               </Button>
            ))}
         </div>

         {/* Advanced Filters */}
         <FilterBar
            baseUrl='/tv'
            preserveParams={{ category }}
         />

         <MediaGrid
            items={items}
            emptyMessage='Không tìm thấy phim bộ nào.'
         />

         <Pagination
            currentPage={page}
            totalPages={data.total_pages}
            baseUrl='/tv'
            searchParams={filterSearchParams}
         />
      </div>
   );
}
