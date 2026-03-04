import { fetchAPI } from '@/lib/api-client';

export interface AdminStats {
   readonly movies: number;
   readonly tvShows: number;
   readonly people: number;
   readonly genres: number;
   readonly videos: number;
   readonly tvVideos: number;
}

export interface ImportResponse {
   readonly message?: string;
   readonly movies?: number;
   readonly tvShows?: number;
   readonly people?: number;
   readonly peopleImported?: number;
}

/** Get database content stats */
export function getAdminStats(token: string): Promise<AdminStats> {
   return fetchAPI<AdminStats>('/import/stats', { token });
}

/** Import all TMDB data */
export function importAll(pages: number = 5, token: string): Promise<ImportResponse> {
   return fetchAPI<ImportResponse>('/import/all', {
      method: 'POST',
      params: { pages },
      token,
   });
}

/** Import only genres */
export function importGenres(token: string): Promise<ImportResponse> {
   return fetchAPI<ImportResponse>('/import/genres', {
      method: 'POST',
      token,
   });
}

/** Import a single movie by ID */
export function importMovie(tmdbId: number, token: string): Promise<ImportResponse> {
   return fetchAPI<ImportResponse>(`/import/movie/${tmdbId}`, {
      method: 'POST',
      token,
   });
}

/** Import a single TV show by ID */
export function importTV(tmdbId: number, token: string): Promise<ImportResponse> {
   return fetchAPI<ImportResponse>(`/import/tv/${tmdbId}`, {
      method: 'POST',
      token,
   });
}
