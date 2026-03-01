'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface PageTransitionProps {
   readonly children: ReactNode;
}

/**
 * Wraps page content with a fade-in + slide-up animation on route change.
 * Uses `usePathname()` as key to re-trigger animation on navigation.
 */
export function PageTransition({ children }: PageTransitionProps) {
   const pathname = usePathname();

   return (
      <motion.div
         key={pathname}
         initial={{ opacity: 0, y: 12 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      >
         {children}
      </motion.div>
   );
}
