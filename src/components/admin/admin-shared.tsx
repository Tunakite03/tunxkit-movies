'use client';

import { useState, useCallback, type FormEvent } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface AdminSearchBarProps {
   readonly placeholder?: string;
   readonly onSearch: (query: string) => void;
   readonly isLoading?: boolean;
}

/** Search bar for admin list pages */
export function AdminSearchBar({
   placeholder = 'Tìm kiếm...',
   onSearch,
   isLoading,
}: AdminSearchBarProps) {
   const [query, setQuery] = useState('');

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

/** Pagination controls for admin list pages */
export function AdminPagination({
   page,
   totalPages,
   totalResults,
   onPageChange,
   isLoading,
}: AdminPaginationProps) {
   return (
      <div className="flex items-center justify-between">
         <p className="text-sm text-muted-foreground">
            Trang {page} / {totalPages} ({totalResults.toLocaleString()} kết quả)
         </p>
         <div className="flex items-center gap-2">
            <Button
               variant="outline"
               size="sm"
               onClick={() => onPageChange(page - 1)}
               disabled={page <= 1 || isLoading}
            >
               <ChevronLeft className="h-4 w-4" />
               Trước
            </Button>
            <Button
               variant="outline"
               size="sm"
               onClick={() => onPageChange(page + 1)}
               disabled={page >= totalPages || isLoading}
            >
               Sau
               <ChevronRight className="h-4 w-4" />
            </Button>
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
