'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import type { ReactNode } from 'react';

import { AuthProvider } from '@/store/auth-provider';
import { StoreInitializer } from '@/store/store-initializer';

interface AppProvidersProps {
   readonly children: ReactNode;
}

/**
 * Consolidated application providers.
 * Wraps children with QueryClient, Auth validation, and store initializer.
 */
export function AppProviders({ children }: AppProvidersProps) {
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

   return (
      <QueryClientProvider client={queryClient}>
         <AuthProvider>
            <StoreInitializer>{children}</StoreInitializer>
         </AuthProvider>
      </QueryClientProvider>
   );
}
