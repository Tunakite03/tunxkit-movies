'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { Video } from '@/types';

interface VideoPlayerProps {
   readonly videos: readonly Video[];
}

/** Find the best trailer from video results */
function findTrailer(videos: readonly Video[]): Video | undefined {
   return (
      videos.find((v) => v.site === 'YouTube' && v.type === 'Trailer' && v.official) ??
      videos.find((v) => v.site === 'YouTube' && v.type === 'Trailer') ??
      videos.find((v) => v.site === 'YouTube')
   );
}

/**
 * Video player with a primary embed and a selectable playlist of
 * available YouTube videos (trailers, teasers, clips, etc.).
 */
export function VideoPlayer({ videos }: VideoPlayerProps) {
   const youtubeVideos = videos.filter((v) => v.site === 'YouTube');
   const defaultVideo = findTrailer(videos) ?? youtubeVideos[0];
   const [activeVideo, setActiveVideo] = useState<Video | undefined>(defaultVideo);

   if (!activeVideo) {
      return (
         <div className='flex aspect-video w-full items-center justify-center rounded-lg border border-border bg-muted'>
            <p className='text-muted-foreground'>Chưa có video nào.</p>
         </div>
      );
   }

   return (
      <div className='space-y-4'>
         {/* Main Player */}
         <div className='relative aspect-video w-full overflow-hidden rounded-lg bg-black'>
            <iframe
               src={`https://www.youtube.com/embed/${activeVideo.key}?autoplay=0&rel=0`}
               title={activeVideo.name}
               allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
               allowFullScreen
               className='absolute inset-0 size-full'
            />
         </div>

         {/* Video Title */}
         <div className='flex items-center gap-2'>
            <Play className='size-4 text-primary' />
            <h3 className='font-semibold'>{activeVideo.name}</h3>
            <span className='text-sm text-muted-foreground'>({activeVideo.type})</span>
         </div>

         {/* Video List */}
         {youtubeVideos.length > 1 && (
            <div className='space-y-2'>
               <h4 className='text-sm font-medium text-muted-foreground'>Tất cả video ({youtubeVideos.length})</h4>
               <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3'>
                  {youtubeVideos.map((video) => (
                     <Button
                        key={video.id}
                        variant={video.id === activeVideo.id ? 'default' : 'outline'}
                        size='sm'
                        className='h-auto justify-start gap-2 px-3 py-2 text-left'
                        onClick={() => setActiveVideo(video)}
                     >
                        <Play className='size-3.5 shrink-0' />
                        <div className='min-w-0'>
                           <p className='truncate text-sm font-medium'>{video.name}</p>
                           <p className='text-xs opacity-70'>{video.type}</p>
                        </div>
                     </Button>
                  ))}
               </div>
            </div>
         )}
      </div>
   );
}
