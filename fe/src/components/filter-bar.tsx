'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { Filter, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { SORT_OPTIONS, RATING_OPTIONS } from '@/constants';
import type { SortBy } from '@/types';

/** Generate year options from current year down to 1970 */
function generateYearOptions(): readonly number[] {
   const currentYear = new Date().getFullYear();
   const years: number[] = [];
   for (let year = currentYear; year >= 1970; year--) {
      years.push(year);
   }
   return years;
}

const YEAR_OPTIONS = generateYearOptions();

interface FilterBarProps {
   /** Base URL for filter links (e.g. '/movies' or '/tv') */
   readonly baseUrl: string;
   /** Additional search params to preserve (e.g. category) */
   readonly preserveParams?: Record<string, string>;
}

/**
 * Advanced filter bar with year, rating, and sort options.
 * Uses URL search params for state (SSR-compatible).
 */
export function FilterBar({ baseUrl, preserveParams = {} }: FilterBarProps) {
   const router = useRouter();
   const searchParams = useSearchParams();

   const currentYear = searchParams.get('year') ?? '';
   const currentSort = (searchParams.get('sort') ?? 'popularity.desc') as SortBy;
   const currentRating = searchParams.get('rating') ?? '0';

   const hasFilters = currentYear || currentSort !== 'popularity.desc' || currentRating !== '0';

   const buildUrl = useCallback(
      (updates: Record<string, string>) => {
         const params = new URLSearchParams();

         // Preserve existing params
         for (const [key, value] of Object.entries(preserveParams)) {
            params.set(key, value);
         }

         // Current filter values
         if (currentYear) params.set('year', currentYear);
         if (currentSort !== 'popularity.desc') params.set('sort', currentSort);
         if (currentRating !== '0') params.set('rating', currentRating);

         // Apply updates
         for (const [key, value] of Object.entries(updates)) {
            if (value) {
               params.set(key, value);
            } else {
               params.delete(key);
            }
         }

         // Reset to page 1 on filter change
         params.delete('page');

         const qs = params.toString();
         return qs ? `${baseUrl}?${qs}` : baseUrl;
      },
      [baseUrl, preserveParams, currentYear, currentSort, currentRating],
   );

   function handleYearChange(e: React.ChangeEvent<HTMLSelectElement>) {
      router.push(buildUrl({ year: e.target.value }));
   }

   function handleSortChange(e: React.ChangeEvent<HTMLSelectElement>) {
      router.push(buildUrl({ sort: e.target.value === 'popularity.desc' ? '' : e.target.value }));
   }

   function handleRatingChange(e: React.ChangeEvent<HTMLSelectElement>) {
      router.push(buildUrl({ rating: e.target.value === '0' ? '' : e.target.value }));
   }

   function handleClearFilters() {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(preserveParams)) {
         params.set(key, value);
      }
      const qs = params.toString();
      router.push(qs ? `${baseUrl}?${qs}` : baseUrl);
   }

   return (
      <div className='flex flex-wrap items-center gap-3'>
         <div className='flex items-center gap-1.5 text-sm font-medium text-muted-foreground'>
            <Filter className='size-4' />
            <span>Bộ lọc</span>
         </div>

         {/* Year Filter */}
         <select
            value={currentYear}
            onChange={handleYearChange}
            className='h-9 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring'
            aria-label='Lọc theo năm'
         >
            <option value=''>Tất cả năm</option>
            {YEAR_OPTIONS.map((year) => (
               <option
                  key={year}
                  value={String(year)}
               >
                  {year}
               </option>
            ))}
         </select>

         {/* Rating Filter */}
         <select
            value={currentRating}
            onChange={handleRatingChange}
            className='h-9 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring'
            aria-label='Lọc theo đánh giá'
         >
            {RATING_OPTIONS.map((opt) => (
               <option
                  key={opt.value}
                  value={String(opt.value)}
               >
                  {opt.label}
               </option>
            ))}
         </select>

         {/* Sort */}
         <select
            value={currentSort}
            onChange={handleSortChange}
            className='h-9 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring'
            aria-label='Sắp xếp'
         >
            {SORT_OPTIONS.map((opt) => (
               <option
                  key={opt.value}
                  value={opt.value}
               >
                  {opt.label}
               </option>
            ))}
         </select>

         {/* Clear Filters */}
         {hasFilters && (
            <Button
               variant='ghost'
               size='sm'
               onClick={handleClearFilters}
               className='gap-1'
            >
               <X className='size-3.5' />
               Xóa bộ lọc
            </Button>
         )}
      </div>
   );
}
