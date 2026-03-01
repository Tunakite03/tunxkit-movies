import { Skeleton } from '@/components/ui/skeleton';

export default function SearchLoading() {
   return (
      <div className='container mx-auto space-y-6 px-4 py-8 md:px-6'>
         <Skeleton className='h-9 w-64' />
         <Skeleton className='h-5 w-48' />
         <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-4'>
            {Array.from({ length: 10 }, (_, i) => (
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
