'use client';

import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';

interface SearchState {
   readonly query: string;
   readonly isSearching: boolean;
}

interface SearchContextValue extends SearchState {
   readonly setQuery: (query: string) => void;
   readonly setIsSearching: (isSearching: boolean) => void;
   readonly clearSearch: () => void;
}

const SearchContext = createContext<SearchContextValue | null>(null);

interface SearchProviderProps {
   readonly children: ReactNode;
}

/**
 * Search context provider for sharing search state across components.
 * Wrap the layout with this provider to access search state globally.
 */
export function SearchProvider({ children }: SearchProviderProps) {
   const [query, setQuery] = useState('');
   const [isSearching, setIsSearching] = useState(false);

   const clearSearch = useCallback(() => {
      setQuery('');
      setIsSearching(false);
   }, []);

   const value = useMemo<SearchContextValue>(
      () => ({
         query,
         isSearching,
         setQuery,
         setIsSearching,
         clearSearch,
      }),
      [query, isSearching, clearSearch],
   );

   return <SearchContext value={value}>{children}</SearchContext>;
}

/**
 * Access the search context.
 * Must be used within a `SearchProvider`.
 *
 * @throws Error if used outside SearchProvider
 */
export function useSearch(): SearchContextValue {
   const context = useContext(SearchContext);
   if (!context) {
      throw new Error('useSearch must be used within a SearchProvider');
   }
   return context;
}
