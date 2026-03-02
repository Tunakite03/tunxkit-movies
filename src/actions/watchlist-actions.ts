import { fetchAPI } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import type { MediaItem } from '@/types';

/** Get the current JWT token, or null if not authenticated */
function getToken(): string | null {
   return useAuthStore.getState().token;
}

/** Add a media item to the signed-in user's watchlist */
export async function addToWatchlist(item: MediaItem): Promise<void> {
   const token = getToken();
   if (!token) return;

   await fetchAPI<MediaItem>('/watchlist', {
      method: 'POST',
      body: {
         id: item.id,
         title: item.title,
         mediaType: item.mediaType,
         posterPath: item.posterPath,
         backdropPath: item.backdropPath,
         overview: item.overview,
         releaseDate: item.releaseDate,
         voteAverage: item.voteAverage,
      },
      token,
      revalidate: false,
      cache: 'no-store',
   });
}

/** Remove a media item from the signed-in user's watchlist */
export async function removeFromWatchlist(mediaId: number, mediaType: 'movie' | 'tv'): Promise<void> {
   const token = getToken();
   if (!token) return;

   await fetchAPI<void>(`/watchlist/${mediaId}/${mediaType}`, {
      method: 'DELETE',
      token,
      revalidate: false,
      cache: 'no-store',
   });
}

/** Clear the signed-in user's entire watchlist */
export async function clearWatchlist(): Promise<void> {
   const token = getToken();
   if (!token) return;

   await fetchAPI<void>('/watchlist/clear', {
      method: 'DELETE',
      token,
      revalidate: false,
      cache: 'no-store',
   });
}

/** Fetch all watchlist items for the signed-in user */
export async function getWatchlist(): Promise<MediaItem[]> {
   const token = getToken();
   if (!token) return [];

   return fetchAPI<MediaItem[]>('/watchlist', {
      token,
      revalidate: false,
      cache: 'no-store',
   });
}
