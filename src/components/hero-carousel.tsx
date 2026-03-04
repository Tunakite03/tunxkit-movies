'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Movie } from '@/types';
import { getBackdropUrl, formatRating, getYear } from '@/lib/image-utils';

interface HeroCarouselProps {
   readonly movies: readonly Movie[];
}

const AUTOPLAY_INTERVAL = 4000;

const slideVariants = {
   enter: (direction: number) => ({
      x: direction > 0 ? '8%' : '-8%',
      opacity: 0,
      scale: 1.02,
   }),
   center: {
      x: 0,
      opacity: 1,
      scale: 1,
   },
   exit: (direction: number) => ({
      x: direction > 0 ? '-8%' : '8%',
      opacity: 0,
      scale: 0.98,
   }),
};

const contentVariants = {
   hidden: { opacity: 0, y: 30 },
   visible: {
      opacity: 1,
      y: 0,
      transition: {
         duration: 0.5,
         delay: 0.3,
         ease: [0.25, 0.1, 0.25, 1] as const,
         staggerChildren: 0.08,
         delayChildren: 0.35,
      },
   },
};

const childVariants = {
   hidden: { opacity: 0, y: 20 },
   visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
   },
};

export function HeroCarousel({ movies }: HeroCarouselProps) {
   const [[currentIndex, direction], setSlide] = useState([0, 0]);
   const [isPaused, setIsPaused] = useState(false);

   const slideCount = movies.length;

   const goTo = useCallback(
      (index: number) => {
         const dir = index > currentIndex ? 1 : -1;
         setSlide([index, dir]);
      },
      [currentIndex],
   );

   const goNext = useCallback(() => {
      setSlide(([prev]) => [(prev + 1) % slideCount, 1]);
   }, [slideCount]);

   const goPrev = useCallback(() => {
      setSlide(([prev]) => [(prev - 1 + slideCount) % slideCount, -1]);
   }, [slideCount]);

   // Autoplay
   useEffect(() => {
      if (isPaused || slideCount <= 1) return;
      const timer = setInterval(goNext, AUTOPLAY_INTERVAL);
      return () => clearInterval(timer);
   }, [isPaused, goNext, slideCount]);

   if (movies.length === 0) return null;

   const movie = movies[currentIndex];
   const backdropUrl = getBackdropUrl(movie.backdrop_path, 'original');
   const year = getYear(movie.release_date);
   const rating = formatRating(movie.vote_average);

   return (
      <section
         className="group relative h-[70vh] min-h-[480px] w-full overflow-hidden md:h-[75vh]"
         onMouseEnter={() => setIsPaused(true)}
         onMouseLeave={() => setIsPaused(false)}
      >
         {/* Slides */}
         <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
               key={currentIndex}
               custom={direction}
               variants={slideVariants}
               initial="enter"
               animate="center"
               exit="exit"
               transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
               className="absolute inset-0"
            >
               {/* Backdrop Image */}
               <Image
                  src={backdropUrl}
                  alt={movie.title}
                  fill
                  priority={currentIndex === 0}
                  sizes="100vw"
                  className="object-cover"
               />
               {/* Gradient Overlays */}
               <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />
               <div className="absolute inset-0 bg-linear-to-r from-background/80 to-transparent" />
            </motion.div>
         </AnimatePresence>

         {/* Content */}
         <div className="container relative mx-auto flex h-full items-end px-4 pb-20 md:px-6 md:pb-20">
            <AnimatePresence mode="wait">
               <motion.div
                  key={currentIndex}
                  className="max-w-2xl space-y-2 md:space-y-4"
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
               >
                  <motion.div className="flex flex-wrap items-center gap-1.5 md:gap-2" variants={childVariants}>
                     <Badge variant="default" className="gap-1">
                        <Star className="size-3 fill-primary-foreground" />
                        {rating}
                     </Badge>
                     {year !== 'N/A' && <Badge variant="secondary">{year}</Badge>}
                     <Badge
                        variant="outline"
                        className="border-orange-500/50 bg-orange-500/10 text-orange-400"
                     >
                        🔥 Hot
                     </Badge>
                  </motion.div>

                  <motion.h2
                     className="text-2xl font-bold tracking-tight md:text-5xl"
                     variants={childVariants}
                  >
                     {movie.title}
                  </motion.h2>

                  <motion.p
                     className="line-clamp-2 text-xs text-muted-foreground md:line-clamp-3 md:text-base"
                     variants={childVariants}
                  >
                     {movie.overview}
                  </motion.p>

                  <motion.div className="flex gap-2 md:gap-3" variants={childVariants}>
                     <Button size="sm" className="md:size-default" asChild>
                        <Link href={`/movies/${movie.id}/watch`} className="gap-2">
                           <Play className="size-4 fill-current" />
                           Xem phim
                        </Link>
                     </Button>
                     <Button variant="outline" size="sm" className="md:size-default" asChild>
                        <Link href={`/movies/${movie.id}`}>Xem chi tiết</Link>
                     </Button>
                  </motion.div>
               </motion.div>
            </AnimatePresence>
         </div>

         {/* Navigation Arrows */}
         {slideCount > 1 && (
            <>
               <button
                  onClick={goPrev}
                  className="absolute left-3 top-1/2 z-20 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/30 text-foreground opacity-0 backdrop-blur-sm transition-all hover:bg-background/60 group-hover:opacity-100 md:left-6 md:flex md:size-12"
                  aria-label="Slide trước"
               >
                  <ChevronLeft className="size-5 md:size-6" />
               </button>
               <button
                  onClick={goNext}
                  className="absolute right-3 top-1/2 z-20 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/30 text-foreground opacity-0 backdrop-blur-sm transition-all hover:bg-background/60 group-hover:opacity-100 md:right-6 md:flex md:size-12"
                  aria-label="Slide tiếp"
               >
                  <ChevronRight className="size-5 md:size-6" />
               </button>
            </>
         )}

         {/* Thumbnail Indicators */}
         {slideCount > 1 && (
            <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 md:bottom-6 md:gap-3">
               {movies.map((m, i) => (
                  <button
                     key={m.id}
                     onClick={() => goTo(i)}
                     aria-label={`Đi đến slide ${i + 1}: ${m.title}`}
                     className={`relative overflow-hidden rounded transition-all duration-500 md:rounded-md ${
                        i === currentIndex
                           ? 'h-8 w-12 ring-1 ring-primary sm:h-9 sm:w-14 md:h-13 md:w-22'
                           : 'h-7 w-11 opacity-50 hover:opacity-80 sm:h-8 sm:w-12 md:h-12 md:w-20'
                     }`}
                  >
                     <Image
                        src={getBackdropUrl(m.backdrop_path, 'small')}
                        alt={m.title}
                        fill
                        sizes="96px"
                        className="object-cover"
                     />
                  </button>
               ))}
            </div>
         )}

         {/* Progress Bar */}
         {/* {slideCount > 1 && !isPaused && (
            <div className="absolute bottom-0 left-0 z-20 h-0.5 w-full bg-foreground/10">
               <motion.div
                  key={currentIndex}
                  className="h-full bg-primary/60"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: AUTOPLAY_INTERVAL / 1000, ease: 'linear' }}
               />
            </div>
         )} */}
      </section>
   );
}
