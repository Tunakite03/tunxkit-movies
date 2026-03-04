'use client';

import { useState, useCallback, type FormEvent, type KeyboardEvent } from 'react';
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface AdminSearchBarProps {
   readonly placeholder?: string;
   readonly initialQuery?: string;
   readonly onSearch: (query: string) => void;
   readonly isLoading?: boolean;
}

/** Search bar for admin list pages */
export function AdminSearchBar({
   placeholder = 'Tìm kiếm...',
   initialQuery = '',
   onSearch,
   isLoading,
}: AdminSearchBarProps) {
   const [query, setQuery] = useState(initialQuery);

   const handleSubmit = useCallback(
      (e: FormEvent) => {
         e.preventDefault();
         onSearch(query.trim());
      },
      [query, onSearch],
   );

   const handleClear = useCallback(() => {
      setQuery('');
      onSearch('');
   }, [onSearch]);

   return (
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
         <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
               type="search"
               placeholder={placeholder}
               value={query}
               onChange={(e) => setQuery(e.target.value)}
               className="pl-9"
               disabled={isLoading}
            />
         </div>
         <Button type="submit" variant="secondary" size="sm" disabled={isLoading}>
            Tìm
         </Button>
         {query && (
            <Button type="button" variant="ghost" size="sm" onClick={handleClear}>
               Xóa
            </Button>
         )}
      </form>
   );
}

interface AdminPaginationProps {
   readonly page: number;
   readonly totalPages: number;
   readonly totalResults: number;
   readonly onPageChange: (page: number) => void;
   readonly isLoading?: boolean;
}

/**
 * Builds a list of page numbers to display, with ellipsis markers.
 * Always shows first, last, and a window around the current page.
 */
function buildPageNumbers(current: number, total: number): ReadonlyArray<number | 'ellipsis'> {
   if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
   }

   const pages: Array<number | 'ellipsis'> = [1];

   const windowStart = Math.max(2, current - 1);
   const windowEnd = Math.min(total - 1, current + 1);

   if (windowStart > 2) {
      pages.push('ellipsis');
   }

   for (let i = windowStart; i <= windowEnd; i++) {
      pages.push(i);
   }

   if (windowEnd < total - 1) {
      pages.push('ellipsis');
   }

   pages.push(total);
   return pages;
}

/** Pagination controls for admin list pages with page numbers and jump-to-page */
export function AdminPagination({
   page,
   totalPages,
   totalResults,
   onPageChange,
   isLoading,
}: AdminPaginationProps) {
   const [jumpValue, setJumpValue] = useState('');

   const handleJump = useCallback(() => {
      const target = Number(jumpValue);
      if (target >= 1 && target <= totalPages && target !== page) {
         onPageChange(target);
      }
      setJumpValue('');
   }, [jumpValue, totalPages, page, onPageChange]);

   const handleJumpKeyDown = useCallback(
      (e: KeyboardEvent<HTMLInputElement>) => {
         if (e.key === 'Enter') {
            handleJump();
         }
      },
      [handleJump],
   );

   const pageNumbers = buildPageNumbers(page, totalPages);

   return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
         <p className="text-sm text-muted-foreground">
            Trang {page} / {totalPages} ({totalResults.toLocaleString()} kết quả)
         </p>

         <div className="flex items-center gap-1">
            {/* First page */}
            <Button
               variant="outline"
               size="icon-sm"
               onClick={() => onPageChange(1)}
               disabled={page <= 1 || isLoading}
               title="Trang đầu"
            >
               <ChevronsLeft className="h-4 w-4" />
            </Button>

            {/* Previous */}
            <Button
               variant="outline"
               size="icon-sm"
               onClick={() => onPageChange(page - 1)}
               disabled={page <= 1 || isLoading}
               title="Trang trước"
            >
               <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Page numbers */}
            <div className="hidden items-center gap-1 sm:flex">
               {pageNumbers.map((item, idx) =>
                  item === 'ellipsis' ? (
                     <span key={`ellipsis-${idx}`} className="px-1 text-sm text-muted-foreground">
                        …
                     </span>
                  ) : (
                     <Button
                        key={item}
                        variant={item === page ? 'default' : 'outline'}
                        size="icon-sm"
                        onClick={() => onPageChange(item)}
                        disabled={isLoading}
                        className="min-w-[2rem] tabular-nums"
                     >
                        {item}
                     </Button>
                  ),
               )}
            </div>

            {/* Next */}
            <Button
               variant="outline"
               size="icon-sm"
               onClick={() => onPageChange(page + 1)}
               disabled={page >= totalPages || isLoading}
               title="Trang sau"
            >
               <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Last page */}
            <Button
               variant="outline"
               size="icon-sm"
               onClick={() => onPageChange(totalPages)}
               disabled={page >= totalPages || isLoading}
               title="Trang cuối"
            >
               <ChevronsRight className="h-4 w-4" />
            </Button>

            {/* Jump to page */}
            {totalPages > 7 && (
               <div className="ml-2 flex items-center gap-1">
                  <Input
                     type="number"
                     min={1}
                     max={totalPages}
                     value={jumpValue}
                     onChange={(e) => setJumpValue(e.target.value)}
                     onKeyDown={handleJumpKeyDown}
                     onBlur={handleJump}
                     placeholder="Trang..."
                     className="h-8 w-20 text-center tabular-nums"
                     disabled={isLoading}
                  />
               </div>
            )}
         </div>
      </div>
   );
}

interface AdminPageHeaderProps {
   readonly title: string;
   readonly description: string;
   readonly icon: React.ReactNode;
   readonly actions?: React.ReactNode;
}

/** Consistent page header for admin sub-pages */
export function AdminPageHeader({ title, description, icon, actions }: AdminPageHeaderProps) {
   return (
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
         <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
               {icon}
               {title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
         </div>
         {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
   );
}
