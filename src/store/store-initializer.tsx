'use client';

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

import { useAuthStore } from './auth-store';
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
   const { isAuthenticated, isHydrated } = useAuthStore();
   const prevAuth = useRef<boolean | null>(null);
   const { loadForGuest, loadForUser, resetToLocal } = useWatchlistStore();
   const { initTheme } = useThemeStore();

   // Initialize theme on mount
   useEffect(() => {
      initTheme();
   }, [initTheme]);

   // Load watchlist based on auth status
   useEffect(() => {
      if (!isHydrated) return;

      if (!isAuthenticated) {
         loadForGuest();
         return;
      }

      loadForUser();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [isHydrated, isAuthenticated]);

   // Detect sign-out: restore localStorage state
   useEffect(() => {
      if (prevAuth.current === true && !isAuthenticated) {
         resetToLocal();
      }
      prevAuth.current = isAuthenticated;
   }, [isAuthenticated, resetToLocal]);

   return <>{children}</>;
}
