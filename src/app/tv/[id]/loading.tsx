import { Skeleton } from '@/components/ui/skeleton';

export default function TVDetailLoading() {
   return (
      <div className='pb-8'>
         <Skeleton className='h-[50vh] min-h-[350px] w-full md:h-[60vh]' />
         <div className='container relative mx-auto -mt-40 px-4 md:-mt-52 md:px-6'>
            <div className='flex flex-col gap-6 md:flex-row md:gap-8'>
               <div className='mx-auto w-[200px] shrink-0 md:mx-0 md:w-[300px]'>
                  <Skeleton className='aspect-2/3 w-full rounded-lg' />
               </div>
               <div className='flex-1 space-y-4'>
                  <Skeleton className='h-10 w-3/4' />
                  <Skeleton className='h-5 w-1/2' />
                  <div className='flex gap-2'>
                     <Skeleton className='h-6 w-16' />
                     <Skeleton className='h-6 w-16' />
                     <Skeleton className='h-6 w-16' />
                  </div>
                  <div className='space-y-2'>
                     <Skeleton className='h-4 w-full' />
                     <Skeleton className='h-4 w-full' />
                     <Skeleton className='h-4 w-3/4' />
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
