import { Skeleton } from '@/components/ui/skeleton';

export default function HomeLoading() {
   return (
      <div className='space-y-8 pb-8 md:space-y-12'>
         {/* Hero Skeleton */}
         <Skeleton className='h-[60vh] min-h-[400px] w-full md:h-[70vh]' />

         {/* Carousel Skeletons */}
         <div className='container mx-auto space-y-8 px-4 md:space-y-12 md:px-6'>
            {Array.from({ length: 3 }, (_, i) => (
               <section key={i}>
                  <Skeleton className='mb-4 h-8 w-48' />
                  <div className='flex gap-3 overflow-hidden md:gap-4'>
                     {Array.from({ length: 6 }, (_, j) => (
                        <div
                           key={j}
                           className='w-[160px] shrink-0 md:w-[200px]'
                        >
                           <Skeleton className='aspect-[2/3] w-full rounded-lg' />
                           <Skeleton className='mt-2 h-4 w-3/4' />
                           <Skeleton className='mt-1 h-3 w-1/2' />
                        </div>
                     ))}
                  </div>
               </section>
            ))}
         </div>
      </div>
   );
}
