import type { Metadata } from 'next';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { MediaGrid } from '@/components/media-grid';
import { Pagination } from '@/components/pagination';
import { FilterBar } from '@/components/filter-bar';
import { fetchTVByCategory, discoverTV } from '@/services';
import { tvShowToMediaItem } from '@/lib/image-utils';
import { TV_SHOW_CATEGORIES, DEFAULT_TV_SHOW_CATEGORY, SITE_URL } from '@/constants';
import type { TVCategory, SortBy } from '@/types';

export const dynamic = 'force-dynamic';

interface TVShowsPageProps {
   readonly searchParams: Promise<{
      category?: string;
      page?: string;
      year?: string;
      sort?: string;
      rating?: string;
   }>;
}

/** Validate category param against TV show categories */
function isValidCategory(value: string | undefined): value is TVCategory {
   return TV_SHOW_CATEGORIES.some((c) => c.value === value);
}

function hasActiveFilters(params: { year?: string; sort?: string; rating?: string }): boolean {
   return Boolean(
      params.year || (params.sort && params.sort !== 'popularity.desc') || params.rating,
   );
}

export async function generateMetadata({ searchParams }: TVShowsPageProps): Promise<Metadata> {
   const { category } = await searchParams;
   const cat = isValidCategory(category) ? category : DEFAULT_TV_SHOW_CATEGORY;
   const label = TV_SHOW_CATEGORIES.find((c) => c.value === cat)?.label ?? 'TV Show';
   return {
      title: `${label} - TV Show`,
      description: `Danh sách TV Show ${label.toLowerCase()} - Chương trình thực tế, talkshow, gameshow hay nhất.`,
      alternates: { canonical: `${SITE_URL}/tv-shows` },
   };
}

export default async function TVShowsPage({ searchParams }: TVShowsPageProps) {
   const params = await searchParams;
   const category = isValidCategory(params.category) ? params.category : DEFAULT_TV_SHOW_CATEGORY;
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
           'variety',
        )
      : await fetchTVByCategory(category, page, 'variety');

   const items = data.results.map(tvShowToMediaItem);

   const filterSearchParams: Record<string, string> = { category };
   if (params.year) filterSearchParams.year = params.year;
   if (params.sort) filterSearchParams.sort = params.sort;
   if (params.rating) filterSearchParams.rating = params.rating;

   return (
      <div className="container mx-auto space-y-6 px-4 py-8 md:px-6">
         <h1 className="text-2xl font-bold tracking-tight md:text-3xl">TV Show</h1>

         {/* Category Tabs */}
         <div className="flex flex-wrap gap-2">
            {TV_SHOW_CATEGORIES.map((cat) => (
               <Button
                  key={cat.value}
                  variant={cat.value === category ? 'default' : 'outline'}
                  size="sm"
                  asChild
               >
                  <Link href={`/tv-shows?category=${cat.value}`} prefetch={false}>
                     {cat.label}
                  </Link>
               </Button>
            ))}
         </div>

         {/* Advanced Filters */}
         <FilterBar baseUrl="/tv-shows" preserveParams={{ category }} />

         <MediaGrid items={items} emptyMessage="Không tìm thấy TV Show nào." />

         <Pagination
            currentPage={page}
            totalPages={data.total_pages}
            baseUrl="/tv-shows"
            searchParams={filterSearchParams}
         />
      </div>
   );
}
