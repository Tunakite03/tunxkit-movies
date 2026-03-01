'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { MediaItem } from '@/types';

const STORAGE_KEY = 'tunxkit-watchlist';

interface WatchlistContextValue {
   readonly items: readonly MediaItem[];
   readonly isInWatchlist: (id: number, mediaType: 'movie' | 'tv') => boolean;
   readonly addToWatchlist: (item: MediaItem) => void;
   readonly removeFromWatchlist: (id: number, mediaType: 'movie' | 'tv') => void;
   readonly toggleWatchlist: (item: MediaItem) => void;
   readonly clearWatchlist: () => void;
   readonly count: number;
}

const WatchlistContext = createContext<WatchlistContextValue | null>(null);

interface WatchlistProviderProps {
   readonly children: ReactNode;
}

function loadWatchlist(): MediaItem[] {
   if (typeof window === 'undefined') return [];
   try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];
      return JSON.parse(saved) as MediaItem[];
   } catch {
      return [];
   }
}

function saveWatchlist(items: readonly MediaItem[]) {
   try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
   } catch {
      // localStorage might be full or unavailable
   }
}

/**
 * Watchlist/favorites context provider.
 * Persists favorites to localStorage as MediaItem[].
 */
export function WatchlistProvider({ children }: WatchlistProviderProps) {
   const [items, setItems] = useState<MediaItem[]>([]);
   const [isLoaded, setIsLoaded] = useState(false);

   // Load from localStorage on mount
   useEffect(() => {
      setItems(loadWatchlist());
      setIsLoaded(true);
   }, []);

   // Persist to localStorage on change (skip initial load)
   useEffect(() => {
      if (isLoaded) {
         saveWatchlist(items);
      }
   }, [items, isLoaded]);

   const isInWatchlist = useCallback(
      (id: number, mediaType: 'movie' | 'tv') => {
         return items.some((item) => item.id === id && item.mediaType === mediaType);
      },
      [items],
   );

   const addToWatchlist = useCallback((item: MediaItem) => {
      setItems((prev) => {
         if (prev.some((i) => i.id === item.id && i.mediaType === item.mediaType)) {
            return prev;
         }
         return [item, ...prev];
      });
   }, []);

   const removeFromWatchlist = useCallback((id: number, mediaType: 'movie' | 'tv') => {
      setItems((prev) => prev.filter((item) => !(item.id === id && item.mediaType === mediaType)));
   }, []);

   const toggleWatchlist = useCallback(
      (item: MediaItem) => {
         if (isInWatchlist(item.id, item.mediaType)) {
            removeFromWatchlist(item.id, item.mediaType);
         } else {
            addToWatchlist(item);
         }
      },
      [isInWatchlist, addToWatchlist, removeFromWatchlist],
   );

   const clearWatchlist = useCallback(() => {
      setItems([]);
   }, []);

   const value = useMemo<WatchlistContextValue>(
      () => ({
         items,
         isInWatchlist,
         addToWatchlist,
         removeFromWatchlist,
         toggleWatchlist,
         clearWatchlist,
         count: items.length,
      }),
      [items, isInWatchlist, addToWatchlist, removeFromWatchlist, toggleWatchlist, clearWatchlist],
   );

   return <WatchlistContext value={value}>{children}</WatchlistContext>;
}

/**
 * Access the watchlist context.
 * Must be used within a `WatchlistProvider`.
 * @throws Error if used outside WatchlistProvider
 */
export function useWatchlist(): WatchlistContextValue {
   const context = useContext(WatchlistContext);
   if (!context) {
      throw new Error('useWatchlist must be used within a WatchlistProvider');
   }
   return context;
}
