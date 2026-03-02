export default function TVWatchLoading() {
   return (
      <div className='container mx-auto space-y-8 px-4 py-8 md:px-6'>
         {/* Title skeleton */}
         <div className='flex items-start gap-4'>
            <div className='size-10 animate-pulse rounded-md bg-muted' />
            <div className='flex-1 space-y-2'>
               <div className='h-8 w-3/4 animate-pulse rounded-md bg-muted' />
               <div className='h-4 w-1/3 animate-pulse rounded-md bg-muted' />
            </div>
         </div>

         <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
            {/* Player skeleton */}
            <div className='lg:col-span-2'>
               <div className='aspect-video w-full animate-pulse rounded-lg bg-muted' />
            </div>
            {/* Sidebar skeleton */}
            <div className='space-y-4'>
               <div className='aspect-2/3 w-full animate-pulse rounded-lg bg-muted' />
               <div className='h-6 w-2/3 animate-pulse rounded-md bg-muted' />
               <div className='h-4 w-1/2 animate-pulse rounded-md bg-muted' />
            </div>
         </div>
      </div>
   );
}
