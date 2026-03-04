import type { PlaybackResponse } from '@/types';
import { fetchAPI } from '@/lib/api-client';

/** Fetch playback sources for a movie */
export function fetchMovieEmbed(movieId: number): Promise<PlaybackResponse> {
   return fetchAPI<PlaybackResponse>(`/embed/movie/${movieId}`, { cache: 'no-store' });
}

/** Fetch playback sources for a TV episode */
export function fetchTVEmbed(
   tvId: number,
   season: number,
   episode: number,
): Promise<PlaybackResponse> {
   return fetchAPI<PlaybackResponse>(`/embed/tv/${tvId}`, {
      params: { season, episode },
      cache: 'no-store',
   });
}
