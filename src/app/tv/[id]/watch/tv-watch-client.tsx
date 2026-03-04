'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Star, Tv, Layers } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { StreamingPlayer } from '@/components/streaming-player';
import { EpisodeSelector } from '@/components/episode-selector';
import { MediaCarousel } from '@/components/media-carousel';
import { fetchTVEmbed } from '@/services';
import { getPosterUrl, formatRating, formatDate } from '@/lib/image-utils';
import type { TVShowDetail, PlaybackSource, MediaItem } from '@/types';

interface TVWatchClientProps {
   readonly show: TVShowDetail;
   readonly initialSources: readonly PlaybackSource[];
   readonly similarItems: readonly MediaItem[];
   readonly initialSeason: number;
   readonly initialEpisode: number;
}

/**
 * Client component that handles TV episode streaming with season/episode navigation.
 * Fetches new embed sources when season or episode changes.
 */
export function TVWatchClient({
   show,
   initialSources,
   similarItems,
   initialSeason,
   initialEpisode,
}: TVWatchClientProps) {
   const [currentSeason, setCurrentSeason] = useState(initialSeason);
   const [currentEpisode, setCurrentEpisode] = useState(initialEpisode);
   const [sources, setSources] = useState<readonly PlaybackSource[]>(initialSources);
   const [isLoading, setIsLoading] = useState(false);

   const posterUrl = getPosterUrl(show.poster_path, 'large');

   const loadEpisodeSources = useCallback(
      async (season: number, episode: number) => {
         setIsLoading(true);
         try {
            const response = await fetchTVEmbed(show.id, season, episode);
            setSources(response.sources);
         } catch {
            setSources([]);
         } finally {
            setIsLoading(false);
         }
      },
      [show.id],
   );

   const handleSeasonChange = useCallback(
      (season: number) => {
         setCurrentSeason(season);
         setCurrentEpisode(1);
         void loadEpisodeSources(season, 1);
      },
      [loadEpisodeSources],
   );

   const handleEpisodeChange = useCallback(
      (episode: number) => {
         setCurrentEpisode(episode);
         void loadEpisodeSources(currentSeason, episode);
      },
      [currentSeason, loadEpisodeSources],
   );

   // Sync URL with current episode for bookmarking
   useEffect(() => {
      const url = new URL(window.location.href);
      url.searchParams.set('season', String(currentSeason));
      url.searchParams.set('episode', String(currentEpisode));
      window.history.replaceState(null, '', url.toString());
   }, [currentSeason, currentEpisode]);

   return (
      <div className="container mx-auto space-y-8 px-4 py-8 md:px-6">
         {/* Back button + Title */}
         <div className="flex items-start gap-4">
            <Button variant="ghost" size="icon" asChild className="mt-1 shrink-0">
               <Link href={`/tv/${show.id}`}>
                  <ArrowLeft className="size-5" />
                  <span className="sr-only">Quay lại</span>
               </Link>
            </Button>
            <div className="min-w-0 flex-1">
               <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                  {show.name} — Mùa {currentSeason} Tập {currentEpisode}
               </h1>
               <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span>{formatDate(show.first_air_date)}</span>
                  <span>•</span>
                  <span>{formatRating(show.vote_average)}/10</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                     <Tv className="size-3.5" />
                     {show.number_of_seasons} mùa
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                     <Layers className="size-3.5" />
                     {show.number_of_episodes} tập
                  </span>
               </div>
            </div>
         </div>

         {/* Main Content */}
         <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Streaming Player + Episode Selector — 2/3 */}
            <div className="space-y-6 lg:col-span-2">
               {isLoading ? (
                  <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-border bg-muted">
                     <div className="text-center">
                        <div className="mx-auto mb-3 size-8 animate-spin rounded-full border-4 border-muted-foreground border-t-primary" />
                        <p className="text-muted-foreground">Đang tải...</p>
                     </div>
                  </div>
               ) : (
                  <StreamingPlayer
                     sources={[...sources]}
                     title={`${show.name} S${currentSeason}E${currentEpisode}`}
                  />
               )}

               {/* Episode Selector */}
               <div className="rounded-lg border border-border bg-card p-4">
                  <h2 className="mb-3 text-lg font-bold">Chọn tập phim</h2>
                  <EpisodeSelector
                     seasons={[...show.seasons]}
                     currentSeason={currentSeason}
                     currentEpisode={currentEpisode}
                     onSeasonChange={handleSeasonChange}
                     onEpisodeChange={handleEpisodeChange}
                  />
               </div>
            </div>

            {/* Sidebar — 1/3 */}
            <aside className="space-y-6">
               {/* Show Card */}
               <div className="overflow-hidden rounded-lg border border-border bg-card">
                  <div className="relative aspect-2/3 w-full">
                     <Image
                        src={posterUrl}
                        alt={show.name}
                        fill
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        className="object-cover"
                     />
                  </div>
                  <div className="space-y-3 p-4">
                     <h2 className="text-lg font-bold">{show.name}</h2>
                     <div className="flex items-center gap-2">
                        <Star className="size-4 fill-primary text-primary" />
                        <span className="font-medium">{formatRating(show.vote_average)}</span>
                        <span className="text-sm text-muted-foreground">
                           ({show.vote_count.toLocaleString()} đánh giá)
                        </span>
                     </div>
                     {show.genres.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                           {show.genres.map((genre) => (
                              <Badge key={genre.id} variant="secondary" className="text-xs">
                                 {genre.name}
                              </Badge>
                           ))}
                        </div>
                     )}
                     {show.overview && (
                        <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">
                           {show.overview}
                        </p>
                     )}
                     <Button variant="outline" size="sm" asChild className="w-full">
                        <Link href={`/tv/${show.id}`}>Xem chi tiết</Link>
                     </Button>
                  </div>
               </div>
            </aside>
         </div>

         <Separator />

         {/* Similar TV Shows */}
         {similarItems.length > 0 && (
            <MediaCarousel title="🎬 Phim bộ tương tự" items={[...similarItems]} />
         )}
      </div>
   );
}
