'use client';

import { useCallback } from 'react';
import { Play } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/ui/select';
import type { Season } from '@/types';

interface EpisodeSelectorProps {
   readonly seasons: readonly Season[];
   readonly currentSeason: number;
   readonly currentEpisode: number;
   readonly onSeasonChange: (season: number) => void;
   readonly onEpisodeChange: (episode: number) => void;
}

/**
 * Season and episode selector for TV shows.
 * Displays a season dropdown and an episode grid.
 */
export function EpisodeSelector({
   seasons,
   currentSeason,
   currentEpisode,
   onSeasonChange,
   onEpisodeChange,
}: EpisodeSelectorProps) {
   const validSeasons = seasons.filter((s) => s.season_number > 0);
   const activeSeason = validSeasons.find((s) => s.season_number === currentSeason);
   const episodeCount = activeSeason?.episode_count ?? 0;

   const handleSeasonChange = useCallback(
      (value: string) => {
         const seasonNum = Number(value);
         onSeasonChange(seasonNum);
      },
      [onSeasonChange],
   );

   return (
      <div className="space-y-3">
         {/* Season Selector */}
         <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">Mùa:</span>
            <Select value={String(currentSeason)} onValueChange={handleSeasonChange}>
               <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Chọn mùa" />
               </SelectTrigger>
               <SelectContent>
                  {validSeasons.map((season) => (
                     <SelectItem key={season.id} value={String(season.season_number)}>
                        {season.name} ({season.episode_count} tập)
                     </SelectItem>
                  ))}
               </SelectContent>
            </Select>
         </div>

         {/* Episode Grid */}
         {episodeCount > 0 && (
            <div className="space-y-2">
               <p className="text-sm font-medium text-muted-foreground">Tập ({episodeCount} tập)</p>
               <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-6 xl:grid-cols-8">
                  {Array.from({ length: episodeCount }, (_, i) => i + 1).map((ep) => (
                     <Button
                        key={ep}
                        variant={ep === currentEpisode ? 'default' : 'outline'}
                        size="sm"
                        className="h-9 w-full"
                        onClick={() => onEpisodeChange(ep)}
                     >
                        {ep === currentEpisode && <Play className="mr-1 size-3" />}
                        {ep}
                     </Button>
                  ))}
               </div>
            </div>
         )}
      </div>
   );
}
