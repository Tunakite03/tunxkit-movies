'use client';

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { useSession } from 'next-auth/react';

import { useWatchlistStore } from './watchlist-store';
import { useThemeStore } from './theme-store';

interface StoreInitializerProps {
   readonly children: ReactNode;
}

/**
 * Initializes Zustand stores that depend on auth state or browser APIs.
 * Replaces the old React Context providers for Theme and Watchlist.
 */
export function StoreInitializer({ children }: StoreInitializerProps) {
   const { data: session, status } = useSession();
   const prevAuthStatus = useRef<string | null>(null);
   const { loadForGuest, loadForUser, resetToLocal } = useWatchlistStore();
   const { initTheme } = useThemeStore();

   // Initialize theme on mount
   useEffect(() => {
      initTheme();
   }, [initTheme]);

   // Load watchlist based on auth status
   useEffect(() => {
      if (status === 'loading') return;

      if (!session) {
         loadForGuest();
         return;
      }

      loadForUser();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [status]);

   // Detect sign-out: restore localStorage state
   useEffect(() => {
      if (prevAuthStatus.current === 'authenticated' && status === 'unauthenticated') {
         resetToLocal();
      }
      prevAuthStatus.current = status;
   }, [status, resetToLocal]);

   return <>{children}</>;
}
