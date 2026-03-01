import { useState, useEffect } from 'react';

/**
 * Track whether a CSS media query matches.
 * Uses `window.matchMedia` with automatic cleanup.
 *
 * @param query - CSS media query string
 * @returns Whether the media query currently matches
 *
 * @example
 * ```tsx
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * const isDesktop = useMediaQuery('(min-width: 1024px)');
 * ```
 */
export function useMediaQuery(query: string): boolean {
   const [matches, setMatches] = useState(false);

   useEffect(() => {
      const mediaQuery = window.matchMedia(query);
      setMatches(mediaQuery.matches);

      function handleChange(event: MediaQueryListEvent) {
         setMatches(event.matches);
      }

      mediaQuery.addEventListener('change', handleChange);
      return () => {
         mediaQuery.removeEventListener('change', handleChange);
      };
   }, [query]);

   return matches;
}
