import { useState, useEffect } from 'react';

/**
 * Debounce a value by a specified delay.
 * Useful for search inputs to avoid excessive API calls.
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns The debounced value
 *
 * @example
 * ```tsx
 * const [query, setQuery] = useState('');
 * const debouncedQuery = useDebounce(query, 300);
 *
 * useEffect(() => {
 *   if (debouncedQuery) searchMovies(debouncedQuery);
 * }, [debouncedQuery]);
 * ```
 */
export function useDebounce<T>(value: T, delay = 500): T {
   const [debouncedValue, setDebouncedValue] = useState<T>(value);

   useEffect(() => {
      const timer = setTimeout(() => {
         setDebouncedValue(value);
      }, delay);

      return () => {
         clearTimeout(timer);
      };
   }, [value, delay]);

   return debouncedValue;
}
