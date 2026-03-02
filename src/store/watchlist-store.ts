'use client';

import { create } from 'zustand';

import type { MediaItem } from '@/types';
import {
   addToWatchlist as dbAdd,
   removeFromWatchlist as dbRemove,
   clearWatchlist as dbClear,
   getWatchlist as dbGet,
} from '@/actions/watchlist-actions';

const STORAGE_KEY = 'tunxkit-watchlist';

interface WatchlistState {
   readonly items: readonly MediaItem[];
   readonly isLoaded: boolean;
}

interface WatchlistActions {
   readonly isInWatchlist: (id: number, mediaType: 'movie' | 'tv') => boolean;
   readonly addToWatchlist: (item: MediaItem, isAuthenticated: boolean) => void;
   readonly removeFromWatchlist: (id: number, mediaType: 'movie' | 'tv', isAuthenticated: boolean) => void;
   readonly toggleWatchlist: (item: MediaItem, isAuthenticated: boolean) => void;
   readonly clearWatchlist: (isAuthenticated: boolean) => void;
   readonly loadForGuest: () => void;
   readonly loadForUser: () => Promise<void>;
   readonly resetToLocal: () => void;
}

type WatchlistStore = WatchlistState & WatchlistActions;

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
 * Watchlist store powered by Zustand.
 * - Guests: persists to localStorage.
 * - Authenticated users: syncs with the database.
 *
 * @example
 * ```ts
 * const { items, toggleWatchlist, count } = useWatchlistStore();
 * ```
 */
export const useWatchlistStore = create<WatchlistStore>()((set, get) => ({
   items: [],
   isLoaded: false,

   isInWatchlist: (id, mediaType) => get().items.some((item) => item.id === id && item.mediaType === mediaType),

   addToWatchlist: (item, isAuthenticated) => {
      set((state) => {
         if (state.items.some((i) => i.id === item.id && i.mediaType === item.mediaType)) return state;
         const newItems = [item, ...state.items];
         if (!isAuthenticated) saveLocalWatchlist(newItems);
         return { items: newItems };
      });
      if (isAuthenticated) dbAdd(item);
   },

   removeFromWatchlist: (id, mediaType, isAuthenticated) => {
      set((state) => {
         const newItems = state.items.filter((item) => !(item.id === id && item.mediaType === mediaType));
         if (!isAuthenticated) saveLocalWatchlist(newItems);
         return { items: newItems };
      });
      if (isAuthenticated) dbRemove(id, mediaType);
   },

   toggleWatchlist: (item, isAuthenticated) => {
      const { isInWatchlist, addToWatchlist, removeFromWatchlist } = get();
      if (isInWatchlist(item.id, item.mediaType)) {
         removeFromWatchlist(item.id, item.mediaType, isAuthenticated);
      } else {
         addToWatchlist(item, isAuthenticated);
      }
   },

   clearWatchlist: (isAuthenticated) => {
      set({ items: [] });
      if (!isAuthenticated) saveLocalWatchlist([]);
      if (isAuthenticated) dbClear();
   },

   loadForGuest: () => {
      set({ items: loadLocalWatchlist(), isLoaded: true });
   },

   loadForUser: async () => {
      const localItems = loadLocalWatchlist();
      const dbItems = await dbGet();
      const merged = mergeItems(dbItems, localItems);
      set({ items: merged, isLoaded: true });

      // Sync local-only items to DB in the background
      const localOnlyItems = localItems.filter(
         (local) => !dbItems.some((db) => db.id === local.id && db.mediaType === local.mediaType),
      );
      for (const item of localOnlyItems) {
         dbAdd(item);
      }
      localStorage.removeItem(STORAGE_KEY);
   },

   resetToLocal: () => {
      set({ items: loadLocalWatchlist(), isLoaded: true });
   },
}));
