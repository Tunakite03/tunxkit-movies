import type { Movie, TVShow, Genre, TMDBResponse } from '@/types';
import { fetchAPI } from '@/lib/api-client';

/** Search movies by query */
export function searchMovies(query: string, page = 1): Promise<TMDBResponse<Movie>> {
   return fetchAPI<TMDBResponse<Movie>>('/search/movies', { params: { query, page } });
}

/** Search TV shows by query */
export function searchTV(query: string, page = 1): Promise<TMDBResponse<TVShow>> {
   return fetchAPI<TMDBResponse<TVShow>>('/search/tv', { params: { query, page } });
}

/** Search multi (movies + TV) */
export function searchMulti(query: string, page = 1): Promise<TMDBResponse<Movie | TVShow>> {
   return fetchAPI<TMDBResponse<Movie | TVShow>>('/search/multi', { params: { query, page } });
}

/** Fetch all movie genres */
export async function fetchGenres(): Promise<readonly Genre[]> {
   const data = await fetchAPI<Genre[]>('/genres/movies');
   return data;
}

/** Fetch all TV show genres */
export async function fetchTVGenres(): Promise<readonly Genre[]> {
   const data = await fetchAPI<Genre[]>('/genres/tv');
   return data;
}
