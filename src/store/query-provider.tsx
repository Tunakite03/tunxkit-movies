'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import type { ReactNode } from 'react';

interface QueryProviderProps {
   readonly children: ReactNode;
}

/**
 * TanStack Query provider for client-side data fetching and caching.
 * Creates a stable QueryClient per component instance to avoid SSR issues.
 */
export function QueryProvider({ children }: QueryProviderProps) {
   const [queryClient] = useState(
      () =>
         new QueryClient({
            defaultOptions: {
               queries: {
                  staleTime: 5 * 60 * 1000, // 5 minutes
                  gcTime: 10 * 60 * 1000, // 10 minutes
                  refetchOnWindowFocus: false,
                  retry: 1,
               },
            },
         }),
   );

   return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
