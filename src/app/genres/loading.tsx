import { Skeleton } from '@/components/ui/skeleton';

export default function GenresLoading() {
   return (
      <div className='container mx-auto space-y-8 px-4 py-8 md:px-6'>
         <Skeleton className='h-9 w-48' />

         {[1, 2].map((section) => (
            <section key={section}>
               <Skeleton className='mb-4 h-7 w-40' />
               <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-4'>
                  {Array.from({ length: 10 }, (_, i) => (
                     <Skeleton
                        key={i}
                        className='h-14 w-full rounded-lg'
                     />
                  ))}
               </div>
            </section>
         ))}
      </div>
   );
}
