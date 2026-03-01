import { Skeleton } from '@/components/ui/skeleton';

export default function WatchlistLoading() {
   return (
      <div className='container mx-auto px-4 py-8 md:px-6'>
         <Skeleton className='mb-2 h-9 w-40' />
         <Skeleton className='mb-8 h-5 w-56' />
         <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'>
            {Array.from({ length: 12 }, (_, i) => (
               <div
                  key={i}
                  className='space-y-2'
               >
                  <Skeleton className='aspect-2/3 w-full rounded-lg' />
                  <Skeleton className='h-4 w-3/4' />
                  <Skeleton className='h-3 w-1/2' />
               </div>
            ))}
         </div>
      </div>
   );
}
