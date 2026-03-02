import { Skeleton } from '@/components/ui/skeleton';

export default function TVLoading() {
   return (
      <div className='container mx-auto space-y-6 px-4 py-8 md:px-6'>
         <Skeleton className='h-9 w-48' />
         <div className='flex gap-2'>
            {Array.from({ length: 4 }, (_, i) => (
               <Skeleton
                  key={i}
                  className='h-8 w-28 rounded-md'
               />
            ))}
         </div>
         <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-4'>
            {Array.from({ length: 20 }, (_, i) => (
               <div key={i}>
                  <Skeleton className='aspect-2/3 w-full rounded-lg' />
                  <Skeleton className='mt-2 h-4 w-3/4' />
                  <Skeleton className='mt-1 h-3 w-1/2' />
               </div>
            ))}
         </div>
      </div>
   );
}
