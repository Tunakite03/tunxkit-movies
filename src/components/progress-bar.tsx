'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type NavState = 'idle' | 'loading' | 'completing';

/**
 * Unified progress bar combining scroll progress + navigation progress + back-to-top.
 *
 * - **Idle**: shows scroll progress (how far the user has scrolled).
 * - **Loading**: shows animated navigation progress with glow effect.
 * - **Back-to-top**: floating button appears after scrolling 400px.
 */
export function ProgressBar() {
   const pathname = usePathname();
   const searchParams = useSearchParams();

   // Scroll state
   const [scrollProgress, setScrollProgress] = useState(0);
   const [showBackToTop, setShowBackToTop] = useState(false);

   // Navigation state
   const [navState, setNavState] = useState<NavState>('idle');
   const [navProgress, setNavProgress] = useState(0);
   const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

   const clearTimer = useCallback(() => {
      if (timerRef.current) {
         clearInterval(timerRef.current);
         timerRef.current = null;
      }
   }, []);

   // ── Scroll tracking ──────────────────────────────────────
   useEffect(() => {
      function handleScroll() {
         const scrollTop = window.scrollY;
         const docHeight = document.documentElement.scrollHeight - window.innerHeight;
         const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

         setScrollProgress(scrollPercent);
         setShowBackToTop(scrollTop > 400);
      }

      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
         window.removeEventListener('scroll', handleScroll);
      };
   }, []);

   const scrollToTop = useCallback(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
   }, []);

   // ── Navigation progress ──────────────────────────────────
   const startNavProgress = useCallback(() => {
      clearTimer();
      setNavProgress(0);
      setNavState('loading');

      let current = 0;
      timerRef.current = setInterval(() => {
         current += Math.max(1, (90 - current) * 0.08);
         if (current >= 90) current = 90;
         setNavProgress(current);
      }, 100);
   }, [clearTimer]);

   const completeNavProgress = useCallback(() => {
      clearTimer();
      setNavProgress(100);
      setNavState('completing');

      const timeout = setTimeout(() => {
         setNavState('idle');
         setNavProgress(0);
      }, 400);

      return () => clearTimeout(timeout);
   }, [clearTimer]);

   // Detect navigation completion via URL change
   useEffect(() => {
      if (navState === 'loading') {
         completeNavProgress();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [pathname, searchParams]);

   // Intercept link clicks to detect navigation start
   useEffect(() => {
      function isInternalNavigation(anchor: HTMLAnchorElement): boolean {
         const href = anchor.href;
         if (!href) return false;
         if (anchor.target === '_blank') return false;
         if (anchor.hasAttribute('download')) return false;

         try {
            const url = new URL(href, window.location.origin);
            if (url.origin !== window.location.origin) return false;
            const current = window.location.pathname + window.location.search;
            const target = url.pathname + url.search;
            if (current === target) return false;
            return true;
         } catch {
            return false;
         }
      }

      function handleClick(e: MouseEvent) {
         if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
         if (e.defaultPrevented) return;

         const anchor = (e.target as HTMLElement).closest('a');
         if (!anchor) return;

         if (isInternalNavigation(anchor)) {
            startNavProgress();
         }
      }

      document.addEventListener('click', handleClick, { capture: true });
      return () => {
         document.removeEventListener('click', handleClick, { capture: true });
      };
   }, [startNavProgress]);

   useEffect(() => clearTimer, [clearTimer]);

   // ── Determine which bar to show ──────────────────────────
   const isNavigating = navState !== 'idle';
   const barWidth = isNavigating ? navProgress : scrollProgress;

   return (
      <>
         {/* Unified Progress Bar */}
         <div className='fixed left-0 top-0 z-[60] h-0.5 w-full bg-transparent'>
            {isNavigating ? (
               <motion.div
                  className='h-full bg-primary shadow-[0_0_8px_var(--color-primary)]'
                  initial={{ width: '0%' }}
                  animate={{ width: `${barWidth}%` }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
               />
            ) : (
               <div
                  className='h-full bg-primary transition-[width] duration-150 ease-out'
                  style={{ width: `${barWidth}%` }}
               />
            )}
         </div>

         {/* Back to Top Button */}
         <AnimatePresence>
            {showBackToTop && (
               <motion.button
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ duration: 0.2 }}
                  onClick={scrollToTop}
                  className='fixed bottom-6 right-6 z-50 flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110'
                  aria-label='Cuộn lên đầu trang'
               >
                  <ArrowUp className='size-5' />
               </motion.button>
            )}
         </AnimatePresence>
      </>
   );
}
