'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import { useSession } from 'next-auth/react';

import type { MediaItem } from '@/types';
import {
   addToWatchlist as dbAdd,
   removeFromWatchlist as dbRemove,
   clearWatchlist as dbClear,
   getWatchlist as dbGet,
} from '@/actions/watchlist-actions';

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

function loadLocalWatchlist(): MediaItem[] {
   if (typeof window === 'undefined') return [];
   try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];
      return JSON.parse(saved) as MediaItem[];
   } catch {
      return [];
   }
}

function saveLocalWatchlist(items: readonly MediaItem[]) {
   try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
   } catch {
      // localStorage might be full or unavailable
   }
}

/** Merge DB items with local items, preferring DB items on conflict */
function mergeItems(dbItems: MediaItem[], localItems: MediaItem[]): MediaItem[] {
   const result = [...dbItems];
   for (const local of localItems) {
      const exists = result.some((i) => i.id === local.id && i.mediaType === local.mediaType);
      if (!exists) result.push(local);
   }
   return result;
}

/**
 * Watchlist/favorites context provider.
 * - Guests: persists to localStorage.
 * - Authenticated users: syncs with the database (localStorage items are merged on first login).
 */
export function WatchlistProvider({ children }: WatchlistProviderProps) {
   const [items, setItems] = useState<MediaItem[]>([]);
   const [isLoaded, setIsLoaded] = useState(false);
   const { data: session, status } = useSession();
   const prevAuthStatus = useRef<string | null>(null);

   // Load initial items based on auth status
   useEffect(() => {
      if (status === 'loading') return;

      if (!session) {
         setItems(loadLocalWatchlist());
         setIsLoaded(true);
         return;
      }

      // Authenticated: load from DB, merge any existing localStorage items
      const localItems = loadLocalWatchlist();
      dbGet().then((dbItems) => {
         const merged = mergeItems(dbItems, localItems);
         setItems(merged);
         // Sync local-only items to DB in the background
         const localOnlyItems = localItems.filter(
            (local) => !dbItems.some((db) => db.id === local.id && db.mediaType === local.mediaType),
         );
         localOnlyItems.forEach((item) => {
            dbAdd(item);
         });
         localStorage.removeItem(STORAGE_KEY);
         setIsLoaded(true);
      });
      // status intentionally triggers re-load on sign-in
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [status]);

   // Detect sign-out: restore localStorage state
   useEffect(() => {
      if (prevAuthStatus.current === 'authenticated' && status === 'unauthenticated') {
         setItems(loadLocalWatchlist());
      }
      prevAuthStatus.current = status;
   }, [status]);

   // Persist to localStorage for guests only
   useEffect(() => {
      if (isLoaded && status === 'unauthenticated') {
         saveLocalWatchlist(items);
      }
   }, [items, isLoaded, status]);

   const isInWatchlist = useCallback(
      (id: number, mediaType: 'movie' | 'tv') => items.some((item) => item.id === id && item.mediaType === mediaType),
      [items],
   );

   const addToWatchlist = useCallback(
      (item: MediaItem) => {
         setItems((prev) => {
            if (prev.some((i) => i.id === item.id && i.mediaType === item.mediaType)) return prev;
            return [item, ...prev];
         });
         if (session) dbAdd(item);
      },
      [session],
   );

   const removeFromWatchlist = useCallback(
      (id: number, mediaType: 'movie' | 'tv') => {
         setItems((prev) => prev.filter((item) => !(item.id === id && item.mediaType === mediaType)));
         if (session) dbRemove(id, mediaType);
      },
      [session],
   );

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
      if (session) dbClear();
   }, [session]);

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
