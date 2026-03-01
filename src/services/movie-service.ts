import type {
   Movie,
   MovieDetail,
   Credits,
   VideosResponse,
   TMDBResponse,
   MovieCategory,
   WatchProviderResponse,
} from '@/types';
import type { DiscoverFilters } from '@/types';
import { fetchTMDB } from './tmdb-client';

/** Fetch trending movies (week) */
export function fetchTrending(page = 1): Promise<TMDBResponse<Movie>> {
   return fetchTMDB<TMDBResponse<Movie>>('/trending/movie/week', {
      page: String(page),
   });
}

/** Fetch movies by category */
export function fetchMoviesByCategory(category: MovieCategory, page = 1): Promise<TMDBResponse<Movie>> {
   return fetchTMDB<TMDBResponse<Movie>>(`/movie/${category}`, {
      page: String(page),
   });
}

/** Fetch popular movies */
export function fetchPopular(page = 1): Promise<TMDBResponse<Movie>> {
   return fetchMoviesByCategory('popular', page);
}

/** Fetch now playing movies */
export function fetchNowPlaying(page = 1): Promise<TMDBResponse<Movie>> {
   return fetchMoviesByCategory('now_playing', page);
}

/** Fetch top rated movies */
export function fetchTopRated(page = 1): Promise<TMDBResponse<Movie>> {
   return fetchMoviesByCategory('top_rated', page);
}

/** Fetch upcoming movies */
export function fetchUpcoming(page = 1): Promise<TMDBResponse<Movie>> {
   return fetchMoviesByCategory('upcoming', page);
}

/** Fetch movie detail by ID */
export function fetchMovieDetail(movieId: number): Promise<MovieDetail> {
   return fetchTMDB<MovieDetail>(`/movie/${movieId}`);
}

/** Fetch movie credits (cast & crew) */
export function fetchMovieCredits(movieId: number): Promise<Credits> {
   return fetchTMDB<Credits>(`/movie/${movieId}/credits`);
}

/** Fetch movie videos (trailers, etc.) */
export function fetchMovieVideos(movieId: number): Promise<VideosResponse> {
   return fetchTMDB<VideosResponse>(`/movie/${movieId}/videos`, {
      language: 'en-US',
   });
}

/** Fetch similar movies */
export function fetchSimilarMovies(movieId: number, page = 1): Promise<TMDBResponse<Movie>> {
   return fetchTMDB<TMDBResponse<Movie>>(`/movie/${movieId}/similar`, {
      page: String(page),
   });
}

/** Fetch movies by genre */
export function fetchMoviesByGenre(genreId: number, page = 1): Promise<TMDBResponse<Movie>> {
   return fetchTMDB<TMDBResponse<Movie>>('/discover/movie', {
      with_genres: String(genreId),
      sort_by: 'popularity.desc',
      page: String(page),
   });
}

/** Discover movies with advanced filters */
export function discoverMovies(filters: DiscoverFilters, page = 1): Promise<TMDBResponse<Movie>> {
   const params: Record<string, string> = {
      page: String(page),
      sort_by: filters.sortBy ?? 'popularity.desc',
   };

   if (filters.year) params.primary_release_year = String(filters.year);
   if (filters.genreId) params.with_genres = String(filters.genreId);
   if (filters.minRating) params['vote_average.gte'] = String(filters.minRating);
   if (filters.maxRating) params['vote_average.lte'] = String(filters.maxRating);

   return fetchTMDB<TMDBResponse<Movie>>('/discover/movie', params);
}

/** Fetch watch providers for a movie */
export function fetchMovieWatchProviders(movieId: number): Promise<WatchProviderResponse> {
   return fetchTMDB<WatchProviderResponse>(`/movie/${movieId}/watch/providers`);
}
