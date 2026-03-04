'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Hls from 'hls.js';
import { AlertTriangle, MonitorPlay, RefreshCw, Film, Globe, Play } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { PlaybackSource } from '@/types';

interface StreamingPlayerProps {
   readonly sources: readonly PlaybackSource[];
   readonly title: string;
}

/** Icon for each source type */
function SourceIcon({ type }: { readonly type: PlaybackSource['sourceType'] }) {
   switch (type) {
      case 'hls':
         return <Play className="mr-1.5 size-3.5" />;
      case 'embed':
         return <Globe className="mr-1.5 size-3.5" />;
      case 'direct':
         return <Film className="mr-1.5 size-3.5" />;
   }
}

/** Format a user-visible label for a source */
function formatSourceLabel(source: PlaybackSource, index: number): string {
   if (source.label) {
      const parts = [source.label];
      if (source.quality) parts.push(source.quality);
      return parts.join(' · ');
   }
   return `Nguồn ${index + 1}`;
}

// ─── Sub-players ────────────────────────────────────────────

interface VideoPlayerProps {
   readonly source: PlaybackSource;
   readonly title: string;
   readonly onError: () => void;
}

/** HLS player using hls.js for .m3u8 streams */
function HlsPlayer({ source, title, onError }: VideoPlayerProps) {
   const videoRef = useRef<HTMLVideoElement>(null);

   useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      // Safari supports HLS natively
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
         video.src = source.sourceUrl;
         return;
      }

      if (!Hls.isSupported()) {
         onError();
         return;
      }

      const hls = new Hls({ enableWorker: true });
      hls.loadSource(source.sourceUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.ERROR, (_event, data) => {
         if (data.fatal) onError();
      });

      return () => {
         hls.destroy();
      };
   }, [source.sourceUrl, onError]);

   return (
      <video
         ref={videoRef}
         controls
         autoPlay
         className="absolute inset-0 size-full bg-black"
         title={title}
      />
   );
}

/** Iframe embed player for third-party sources */
function EmbedPlayer({ source, title, onError }: VideoPlayerProps) {
   return (
      <iframe
         src={source.sourceUrl}
         title={title}
         allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
         allowFullScreen
         className="absolute inset-0 size-full border-0"
         referrerPolicy="origin"
         sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
         onError={onError}
      />
   );
}

/** Direct .mp4 / .webm player */
function DirectPlayer({ source, title, onError }: VideoPlayerProps) {
   return (
      <video
         src={source.sourceUrl}
         controls
         autoPlay
         className="absolute inset-0 size-full bg-black"
         title={title}
         onError={onError}
      />
   );
}

// ─── Main component ─────────────────────────────────────────

/**
 * Full-featured streaming player supporting HLS (.m3u8), embed (iframe),
 * and direct (mp4/webm) source types. Users can switch between sources.
 */
export function StreamingPlayer({ sources, title }: StreamingPlayerProps) {
   const [activeIndex, setActiveIndex] = useState(0);
   const [hasError, setHasError] = useState(false);

   const activeSource = sources[activeIndex];

   const handleSourceChange = useCallback((index: number) => {
      setActiveIndex(index);
      setHasError(false);
   }, []);

   const handleRetry = useCallback(() => {
      setHasError(false);
   }, []);

   const handleError = useCallback(() => {
      setHasError(true);
   }, []);

   if (sources.length === 0) {
      return (
         <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-border bg-muted">
            <div className="text-center">
               <MonitorPlay className="mx-auto mb-2 size-10 text-muted-foreground" />
               <p className="text-muted-foreground">Không có nguồn phát nào khả dụng.</p>
            </div>
         </div>
      );
   }

   if (!activeSource) return null;

   return (
      <div className="space-y-3">
         {/* Video Player */}
         <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
            {hasError ? (
               <div className="flex size-full items-center justify-center bg-muted">
                  <div className="text-center">
                     <AlertTriangle className="mx-auto mb-2 size-10 text-destructive" />
                     <p className="mb-3 text-muted-foreground">Nguồn phát không khả dụng.</p>
                     <div className="flex justify-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleRetry}>
                           <RefreshCw className="mr-1.5 size-3.5" />
                           Thử lại
                        </Button>
                        {activeIndex < sources.length - 1 && (
                           <Button size="sm" onClick={() => handleSourceChange(activeIndex + 1)}>
                              Nguồn tiếp theo
                           </Button>
                        )}
                     </div>
                  </div>
               </div>
            ) : (
               <PlayerSwitch
                  key={`${activeSource.id}-${activeIndex}`}
                  source={activeSource}
                  title={title}
                  onError={handleError}
               />
            )}
         </div>

         {/* Source Selector */}
         {sources.length > 1 && (
            <div className="space-y-2">
               <p className="text-sm font-medium text-muted-foreground">
                  Nguồn phát ({activeIndex + 1}/{sources.length})
               </p>
               <div className="flex flex-wrap gap-2">
                  {sources.map((source, index) => (
                     <Button
                        key={source.id}
                        variant={index === activeIndex ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleSourceChange(index)}
                     >
                        <SourceIcon type={source.sourceType} />
                        {formatSourceLabel(source, index)}
                        {source.quality && (
                           <Badge variant="secondary" className="ml-1.5 text-[10px]">
                              {source.quality}
                           </Badge>
                        )}
                     </Button>
                  ))}
               </div>
            </div>
         )}
      </div>
   );
}

/** Route to the correct sub-player based on source type */
function PlayerSwitch({ source, title, onError }: VideoPlayerProps) {
   switch (source.sourceType) {
      case 'hls':
         return <HlsPlayer source={source} title={title} onError={onError} />;
      case 'embed':
         return <EmbedPlayer source={source} title={title} onError={onError} />;
      case 'direct':
         return <DirectPlayer source={source} title={title} onError={onError} />;
   }
}
