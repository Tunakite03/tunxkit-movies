import type { Movie, TVShow, Genre, TMDBResponse } from '@/types';
import { fetchTMDB } from './tmdb-client';

/** Search movies by query */
export function searchMovies(query: string, page = 1): Promise<TMDBResponse<Movie>> {
   return fetchTMDB<TMDBResponse<Movie>>('/search/movie', {
      query,
      page: String(page),
      include_adult: 'false',
   });
}

/** Search TV shows by query */
export function searchTV(query: string, page = 1): Promise<TMDBResponse<TVShow>> {
   return fetchTMDB<TMDBResponse<TVShow>>('/search/tv', {
      query,
      page: String(page),
      include_adult: 'false',
   });
}

/** Search multi (movies + TV) */
export function searchMulti(query: string, page = 1): Promise<TMDBResponse<Movie | TVShow>> {
   return fetchTMDB<TMDBResponse<Movie | TVShow>>('/search/multi', {
      query,
      page: String(page),
      include_adult: 'false',
   });
}

/** Fetch all movie genres */
export async function fetchGenres(): Promise<readonly Genre[]> {
   const data = await fetchTMDB<{ genres: Genre[] }>('/genre/movie/list');
   return data.genres;
}

/** Fetch all TV show genres */
export async function fetchTVGenres(): Promise<readonly Genre[]> {
   const data = await fetchTMDB<{ genres: Genre[] }>('/genre/tv/list');
   return data.genres;
}
