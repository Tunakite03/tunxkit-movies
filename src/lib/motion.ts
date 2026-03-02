/**
 * Shared Framer Motion animation variants.
 * Import these to keep animations consistent across the app.
 */

import type { Variants, Transition } from 'framer-motion';

/** Default spring transition */
export const SPRING_TRANSITION: Transition = {
   type: 'spring',
   stiffness: 260,
   damping: 20,
};

/** Smooth ease transition */
export const EASE_TRANSITION: Transition = {
   duration: 0.3,
   ease: [0.25, 0.1, 0.25, 1],
};

/** Fade in from bottom */
export const fadeInUp: Variants = {
   hidden: { opacity: 0, y: 20 },
   visible: { opacity: 1, y: 0 },
};

/** Fade in */
export const fadeIn: Variants = {
   hidden: { opacity: 0 },
   visible: { opacity: 1 },
};

/** Scale up from smaller */
export const scaleIn: Variants = {
   hidden: { opacity: 0, scale: 0.95 },
   visible: { opacity: 1, scale: 1 },
};

/** Staggered children container */
export const staggerContainer: Variants = {
   hidden: { opacity: 0 },
   visible: {
      opacity: 1,
      transition: {
         staggerChildren: 0.05,
         delayChildren: 0.1,
      },
   },
};

/** Slide in from left */
export const slideInLeft: Variants = {
   hidden: { opacity: 0, x: -20 },
   visible: { opacity: 1, x: 0 },
};

/** Slide in from right */
export const slideInRight: Variants = {
   hidden: { opacity: 0, x: 20 },
   visible: { opacity: 1, x: 0 },
};
