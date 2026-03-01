'use client';

import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeState {
   readonly theme: Theme;
   readonly resolvedTheme: ResolvedTheme;
}

interface ThemeActions {
   readonly setTheme: (theme: Theme) => void;
   readonly toggleTheme: () => void;
   readonly initTheme: () => void;
}

type ThemeStore = ThemeState & ThemeActions;

const STORAGE_KEY = 'tunxkit-theme';

function getSystemTheme(): ResolvedTheme {
   if (typeof window === 'undefined') return 'dark';
   return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(theme: Theme): ResolvedTheme {
   if (theme === 'system') return getSystemTheme();
   return theme;
}

function applyThemeToDOM(resolved: ResolvedTheme) {
   if (typeof document === 'undefined') return;
   const root = document.documentElement;
   root.classList.remove('light', 'dark');
   root.classList.add(resolved);
}

/**
 * Theme store powered by Zustand.
 * Persists user preference to localStorage and applies class to `<html>`.
 *
 * @example
 * ```ts
 * const { theme, resolvedTheme, setTheme, toggleTheme } = useThemeStore();
 * ```
 */
export const useThemeStore = create<ThemeStore>()((set, get) => ({
   theme: 'dark',
   resolvedTheme: 'dark',

   setTheme: (theme) => {
      const resolved = resolveTheme(theme);
      set({ theme, resolvedTheme: resolved });
      applyThemeToDOM(resolved);
      try {
         localStorage.setItem(STORAGE_KEY, theme);
      } catch {
         // localStorage might be unavailable
      }
   },

   toggleTheme: () => {
      const current = get().theme;
      const next = current === 'dark' ? 'light' : 'dark';
      get().setTheme(next);
   },

   initTheme: () => {
      if (typeof window === 'undefined') return;

      const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (saved && ['light', 'dark', 'system'].includes(saved)) {
         const resolved = resolveTheme(saved);
         set({ theme: saved, resolvedTheme: resolved });
         applyThemeToDOM(resolved);
      }

      // Listen for system preference changes when using 'system' theme
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', () => {
         if (get().theme === 'system') {
            const resolved = getSystemTheme();
            set({ resolvedTheme: resolved });
            applyThemeToDOM(resolved);
         }
      });
   },
}));
