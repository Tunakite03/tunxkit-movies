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

function resolveTheme(theme: Theme): ResolvedTheme {
   if (theme === 'system') return getSystemTheme();
   return theme;
}

/**
 * Theme provider for dark/light mode toggle.
 * Persists user preference to localStorage.
 * Defaults to 'dark' if no preference is saved.
 */
export function ThemeProvider({ children, defaultTheme = 'dark' }: ThemeProviderProps) {
   const [theme, setThemeState] = useState<Theme>(defaultTheme);
   const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(resolveTheme(defaultTheme));

   // Load saved theme on mount
   useEffect(() => {
      const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (saved && ['light', 'dark', 'system'].includes(saved)) {
         setThemeState(saved);
         setResolvedTheme(resolveTheme(saved));
      }
   }, []);

   // Apply theme class to <html>
   useEffect(() => {
      const resolved = resolveTheme(theme);
      setResolvedTheme(resolved);

      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(resolved);
   }, [theme]);

   // Listen for system theme changes when in 'system' mode
   useEffect(() => {
      if (theme !== 'system') return;

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      function handleChange() {
         setResolvedTheme(getSystemTheme());
         const root = document.documentElement;
         root.classList.remove('light', 'dark');
         root.classList.add(getSystemTheme());
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
