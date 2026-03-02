'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Combined scroll progress indicator + back to top button.
 * - Progress bar at top of page
 * - Floating button appears after scrolling 400px
 */
export function ScrollProgress() {
   const [progress, setProgress] = useState(0);
   const [isVisible, setIsVisible] = useState(false);

   useEffect(() => {
      function handleScroll() {
         const scrollTop = window.scrollY;
         const docHeight = document.documentElement.scrollHeight - window.innerHeight;
         const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

         setProgress(scrollPercent);
         setIsVisible(scrollTop > 400);
      }

      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
         window.removeEventListener('scroll', handleScroll);
      };
   }, []);

   const scrollToTop = useCallback(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
   }, []);

   return (
      <>
         {/* Progress Bar */}
         <div className='fixed left-0 top-0 z-60 h-0.5 w-full bg-transparent'>
            <div
               className='h-full bg-primary transition-[width] duration-150 ease-out'
               style={{ width: `${progress}%` }}
            />
         </div>

         {/* Back to Top Button */}
         <AnimatePresence>
            {isVisible && (
               <motion.button
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ duration: 0.2 }}
                  onClick={scrollToTop}
                  className='fixed bottom-6 right-6 z-50 flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-300 hover:scale-110 '
                  aria-label='Cuộn lên đầu trang'
               >
                  <ArrowUp className='size-5' />
               </motion.button>
            )}
         </AnimatePresence>
      </>
   );
}
