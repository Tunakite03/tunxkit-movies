'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface PaginationProps {
   readonly currentPage: number;
   readonly totalPages: number;
   readonly baseUrl: string;
   readonly searchParams?: Record<string, string>;
}

/**
 * Pagination component for movie list pages.
 * Limits total pages to 500 (TMDB API limit).
 */
export function Pagination({ currentPage, totalPages, baseUrl, searchParams = {} }: PaginationProps) {
   const maxPages = Math.min(totalPages, 500);
   if (maxPages <= 1) return null;

   function buildUrl(page: number): string {
      const params = new URLSearchParams(searchParams);
      params.set('page', String(page));
      return `${baseUrl}?${params.toString()}`;
   }

   const hasPrev = currentPage > 1;
   const hasNext = currentPage < maxPages;

   // Show up to 5 page numbers around current
   const startPage = Math.max(1, currentPage - 2);
   const endPage = Math.min(maxPages, currentPage + 2);
   const pages: number[] = [];
   for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
   }

   return (
      <nav
         className='flex items-center justify-center gap-1'
         aria-label='Phân trang'
      >
         <Button
            variant='outline'
            size='icon'
            disabled={!hasPrev}
            asChild={hasPrev}
         >
            {hasPrev ? (
               <Link
                  href={buildUrl(currentPage - 1)}
                  aria-label='Trang trước'
               >
                  <ChevronLeft className='size-4' />
               </Link>
            ) : (
               <span>
                  <ChevronLeft className='size-4' />
               </span>
            )}
         </Button>

         {startPage > 1 && (
            <>
               <Button
                  variant='outline'
                  size='sm'
                  asChild
               >
                  <Link href={buildUrl(1)}>1</Link>
               </Button>
               {startPage > 2 && <span className='px-1 text-muted-foreground'>...</span>}
            </>
         )}

         {pages.map((page) => (
            <Button
               key={page}
               variant={page === currentPage ? 'default' : 'outline'}
               size='sm'
               asChild={page !== currentPage}
            >
               {page === currentPage ? <span>{page}</span> : <Link href={buildUrl(page)}>{page}</Link>}
            </Button>
         ))}

         {endPage < maxPages && (
            <>
               {endPage < maxPages - 1 && <span className='px-1 text-muted-foreground'>...</span>}
               <Button
                  variant='outline'
                  size='sm'
                  asChild
               >
                  <Link href={buildUrl(maxPages)}>{maxPages}</Link>
               </Button>
            </>
         )}

         <Button
            variant='outline'
            size='icon'
            disabled={!hasNext}
            asChild={hasNext}
         >
            {hasNext ? (
               <Link
                  href={buildUrl(currentPage + 1)}
                  aria-label='Trang sau'
               >
                  <ChevronRight className='size-4' />
               </Link>
            ) : (
               <span>
                  <ChevronRight className='size-4' />
               </span>
            )}
         </Button>
      </nav>
   );
}
