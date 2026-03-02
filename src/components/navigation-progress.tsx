'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

type ProgressState = 'idle' | 'loading' | 'completing';

/**
 * NProgress-style navigation progress bar.
 * - Detects navigation start by intercepting internal link clicks (event delegation).
 * - Detects navigation end by monitoring `usePathname` + `useSearchParams` changes.
 * - Animated with Framer Motion for a polished feel.
 */
export function NavigationProgress() {
   const pathname = usePathname();
   const searchParams = useSearchParams();
   const [state, setState] = useState<ProgressState>('idle');
   const [progress, setProgress] = useState(0);
   const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
   const targetHrefRef = useRef<string | null>(null);

   const clearTimer = useCallback(() => {
      if (timerRef.current) {
         clearInterval(timerRef.current);
         timerRef.current = null;
      }
   }, []);

   const startProgress = useCallback(() => {
      clearTimer();
      setProgress(0);
      setState('loading');

      // Simulate gradual progress (slows down as it approaches 90%)
      let current = 0;
      timerRef.current = setInterval(() => {
         current += Math.max(1, (90 - current) * 0.08);
         if (current >= 90) current = 90;
         setProgress(current);
      }, 100);
   }, [clearTimer]);

   const completeProgress = useCallback(() => {
      clearTimer();
      setProgress(100);
      setState('completing');

      // Reset after animation completes
      const timeout = setTimeout(() => {
         setState('idle');
         setProgress(0);
         targetHrefRef.current = null;
      }, 400);

      return () => clearTimeout(timeout);
   }, [clearTimer]);

   // Detect navigation completion via URL change
   useEffect(() => {
      if (state === 'loading') {
         completeProgress();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [pathname, searchParams]);

   // Intercept link clicks to detect navigation start
   useEffect(() => {
      function isInternalNavigation(anchor: HTMLAnchorElement): boolean {
         const href = anchor.href;
         if (!href) return false;

         // Skip external links, hash-only, download, new tab
         if (anchor.target === '_blank') return false;
         if (anchor.hasAttribute('download')) return false;

         try {
            const url = new URL(href, window.location.origin);
            // Only internal same-origin links
            if (url.origin !== window.location.origin) return false;
            // Skip if same URL (including hash)
            const current = window.location.pathname + window.location.search;
            const target = url.pathname + url.search;
            if (current === target) return false;
            return true;
         } catch {
            return false;
         }
      }

      function handleClick(e: MouseEvent) {
         // Skip modified clicks (ctrl+click, cmd+click, etc.)
         if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
         if (e.defaultPrevented) return;

         // Walk up the DOM to find the closest <a>
         const anchor = (e.target as HTMLElement).closest('a');
         if (!anchor) return;

         if (isInternalNavigation(anchor)) {
            targetHrefRef.current = anchor.href;
            startProgress();
         }
      }

      document.addEventListener('click', handleClick, { capture: true });
      return () => {
         document.removeEventListener('click', handleClick, { capture: true });
      };
   }, [startProgress]);

   // Cleanup on unmount
   useEffect(() => clearTimer, [clearTimer]);

   return (
      <AnimatePresence>
         {state !== 'idle' && (
            <motion.div
               className='fixed left-0 top-0 z-[70] h-0.5 w-full'
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 0.2 }}
            >
               <motion.div
                  className='h-full bg-primary shadow-[0_0_8px_var(--color-primary)]'
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
               />
            </motion.div>
         )}
      </AnimatePresence>
   );
}
