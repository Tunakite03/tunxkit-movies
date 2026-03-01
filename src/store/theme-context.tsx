'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextValue {
   readonly theme: Theme;
   readonly resolvedTheme: ResolvedTheme;
   readonly setTheme: (theme: Theme) => void;
   readonly toggleTheme: () => void;
}

const STORAGE_KEY = 'tunxkit-theme';

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
   readonly children: ReactNode;
   readonly defaultTheme?: Theme;
}

function getSystemTheme(): ResolvedTheme {
   if (typeof window === 'undefined') return 'dark';
   return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Theme provider for dark/light mode toggle.
 * Persists user preference to localStorage.
 * Defaults to 'dark' if no preference is saved.
 */
export function ThemeProvider({ children, defaultTheme = 'dark' }: ThemeProviderProps) {
   // Initialize from localStorage to avoid sync setState in effect body
   const [theme, setThemeState] = useState<Theme>(() => {
      if (typeof window === 'undefined') return defaultTheme;
      const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (saved && (['light', 'dark', 'system'] as const).includes(saved as Theme)) return saved as Theme;
      return defaultTheme;
   });

   // Track actual system preference so resolvedTheme can be derived without setState in effect
   const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme);

   // resolvedTheme is fully derived — no separate state needed
   const resolvedTheme = useMemo<ResolvedTheme>(
      () => (theme === 'system' ? systemTheme : theme),
      [theme, systemTheme],
   );

   // Apply theme class to <html> — pure DOM side-effect, no setState
   useEffect(() => {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(resolvedTheme);
   }, [resolvedTheme]);

   // Listen for system preference changes when theme === 'system'
   useEffect(() => {
      if (theme !== 'system') return;

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      function handleChange() {
         setSystemTheme(getSystemTheme());
      }

      mediaQuery.addEventListener('change', handleChange);
      return () => {
         mediaQuery.removeEventListener('change', handleChange);
      };
   }, [theme]);

   const setTheme = useCallback((newTheme: Theme) => {
      setThemeState(newTheme);
      localStorage.setItem(STORAGE_KEY, newTheme);
   }, []);

   const toggleTheme = useCallback(() => {
      setThemeState((prev) => {
         const next = prev === 'dark' ? 'light' : 'dark';
         localStorage.setItem(STORAGE_KEY, next);
         return next;
      });
   }, []);

   const value = useMemo<ThemeContextValue>(
      () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
      [theme, resolvedTheme, setTheme, toggleTheme],
   );

   return <ThemeContext value={value}>{children}</ThemeContext>;
}

/**
 * Access the theme context.
 * Must be used within a `ThemeProvider`.
 * @throws Error if used outside ThemeProvider
 */
export function useTheme(): ThemeContextValue {
   const context = useContext(ThemeContext);
   if (!context) {
      throw new Error('useTheme must be used within a ThemeProvider');
   }
   return context;
}
