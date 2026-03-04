'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface AdminSearchParamsState {
   readonly page: number;
   readonly search: string;
   readonly setPage: (page: number) => void;
   readonly setSearch: (query: string) => void;
}

/**
 * Syncs admin list page/search state with URL search params
 * so pagination survives page reloads and enables shareable links.
 */
export function useAdminSearchParams(): AdminSearchParamsState {
   const router = useRouter();
   const pathname = usePathname();
   const searchParams = useSearchParams();

   const page = Math.max(1, Number(searchParams.get('page')) || 1);
   const search = searchParams.get('search') ?? '';

   const updateParams = useCallback(
      (updates: Record<string, string | undefined>) => {
         const params = new URLSearchParams(searchParams.toString());

         for (const [key, value] of Object.entries(updates)) {
            if (value === undefined || value === '' || value === '1') {
               params.delete(key);
            } else {
               params.set(key, value);
            }
         }

         const qs = params.toString();
         router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
      },
      [router, pathname, searchParams],
   );

   const setPage = useCallback(
      (newPage: number) => {
         updateParams({ page: String(newPage) });
      },
      [updateParams],
   );

   const setSearch = useCallback(
      (query: string) => {
         // Reset to page 1 when search changes
         updateParams({ search: query || undefined, page: undefined });
      },
      [updateParams],
   );

   return { page, search, setPage, setSearch };
}
