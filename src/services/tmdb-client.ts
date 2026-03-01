import { TMDB_BASE_URL, REVALIDATE_TIME } from '@/constants';

/**
 * Get TMDB API key from environment variables.
 * @throws Error if TMDB_API_KEY is not set
 */
function getApiKey(): string {
   const key = process.env.TMDB_API_KEY;
   if (!key) {
      throw new Error('TMDB_API_KEY is not set. Get one at https://www.themoviedb.org/settings/api');
   }
   return key;
}

/**
 * Generic fetch helper for TMDB API.
 * Handles auth, error handling, and caching.
 * @param endpoint - TMDB API endpoint (e.g. '/movie/popular')
 * @param params - Additional query parameters
 * @returns Parsed JSON response
 * @throws Error on non-OK HTTP response
 */
export async function fetchTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
   const apiKey = getApiKey();
   const searchParams = new URLSearchParams({
      api_key: apiKey,
      language: 'vi-VN',
      ...params,
   });

   const url = `${TMDB_BASE_URL}${endpoint}?${searchParams.toString()}`;
   const response = await fetch(url, {
      next: { revalidate: REVALIDATE_TIME },
   });

   if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status} ${response.statusText} for ${endpoint}`);
   }

   return response.json() as Promise<T>;
}
