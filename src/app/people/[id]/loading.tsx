import { Skeleton } from '@/components/ui/skeleton';

export default function PersonDetailLoading() {
   return (
      <div className='container mx-auto px-4 py-8 md:px-6'>
         <div className='flex flex-col gap-8 md:flex-row'>
            <Skeleton className='mx-auto aspect-2/3 w-64 rounded-lg md:w-72' />
            <div className='flex-1 space-y-4'>
               <Skeleton className='h-10 w-64' />
               <div className='flex gap-3'>
                  <Skeleton className='h-6 w-24' />
                  <Skeleton className='h-6 w-40' />
               </div>
               <div className='space-y-2'>
                  <Skeleton className='h-6 w-20' />
                  <Skeleton className='h-40 w-full' />
               </div>
            </div>
         </div>
         <div className='mt-8 space-y-4'>
            <Skeleton className='h-8 w-40' />
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
      </div>
   );
}
