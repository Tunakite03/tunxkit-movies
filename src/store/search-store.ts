'use client';

import { create } from 'zustand';

interface SearchState {
   readonly query: string;
   readonly isSearching: boolean;
}

interface SearchActions {
   readonly setQuery: (query: string) => void;
   readonly setIsSearching: (isSearching: boolean) => void;
   readonly clearSearch: () => void;
}

type SearchStore = SearchState & SearchActions;

/**
 * Search state store powered by Zustand.
 * Replaces the old React Context-based SearchProvider.
 *
 * @example
 * ```ts
 * const { query, setQuery, clearSearch } = useSearchStore();
 * ```
 */
export const useSearchStore = create<SearchStore>()((set) => ({
   query: '',
   isSearching: false,

   setQuery: (query) => set({ query }),
   setIsSearching: (isSearching) => set({ isSearching }),
   clearSearch: () => set({ query: '', isSearching: false }),
}));
