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
import { fetchAPI } from '@/lib/api-client';

const CATEGORY_PATH: Record<MovieCategory, string> = {
   popular: '/movies/popular',
   top_rated: '/movies/top-rated',
   now_playing: '/movies/now-playing',
   upcoming: '/movies/upcoming',
};

/** Fetch trending movies (week) */
export function fetchTrending(page = 1): Promise<TMDBResponse<Movie>> {
   return fetchAPI<TMDBResponse<Movie>>('/movies/trending', { params: { page } });
}

/** Fetch movies by category */
export function fetchMoviesByCategory(category: MovieCategory, page = 1): Promise<TMDBResponse<Movie>> {
   const path = CATEGORY_PATH[category] ?? '/movies/popular';
   return fetchAPI<TMDBResponse<Movie>>(path, { params: { page } });
}

/** Fetch popular movies */
export function fetchPopular(page = 1): Promise<TMDBResponse<Movie>> {
   return fetchAPI<TMDBResponse<Movie>>('/movies/popular', { params: { page } });
}

/** Fetch now playing movies */
export function fetchNowPlaying(page = 1): Promise<TMDBResponse<Movie>> {
   return fetchAPI<TMDBResponse<Movie>>('/movies/now-playing', { params: { page } });
}

/** Fetch top rated movies */
export function fetchTopRated(page = 1): Promise<TMDBResponse<Movie>> {
   return fetchAPI<TMDBResponse<Movie>>('/movies/top-rated', { params: { page } });
}

/** Fetch upcoming movies */
export function fetchUpcoming(page = 1): Promise<TMDBResponse<Movie>> {
   return fetchAPI<TMDBResponse<Movie>>('/movies/upcoming', { params: { page } });
}

/** Fetch movie detail by ID */
export function fetchMovieDetail(movieId: number): Promise<MovieDetail> {
   return fetchAPI<MovieDetail>(`/movies/${movieId}`);
}

/** Fetch movie credits (cast & crew) */
export function fetchMovieCredits(movieId: number): Promise<Credits> {
   return fetchAPI<Credits>(`/movies/${movieId}/credits`);
}

/** Fetch movie videos (trailers, etc.) */
export function fetchMovieVideos(movieId: number): Promise<VideosResponse> {
   return fetchAPI<VideosResponse>(`/movies/${movieId}/videos`);
}

/** Fetch similar movies */
export function fetchSimilarMovies(movieId: number, page = 1): Promise<TMDBResponse<Movie>> {
   return fetchAPI<TMDBResponse<Movie>>(`/movies/${movieId}/similar`, { params: { page } });
}

/** Fetch movies by genre */
export function fetchMoviesByGenre(genreId: number, page = 1): Promise<TMDBResponse<Movie>> {
   return fetchAPI<TMDBResponse<Movie>>(`/movies/genre/${genreId}`, { params: { page } });
}

/** Discover movies with advanced filters */
export function discoverMovies(filters: DiscoverFilters, page = 1): Promise<TMDBResponse<Movie>> {
   return fetchAPI<TMDBResponse<Movie>>('/movies/discover', {
      params: {
         page,
         year: filters.year,
         genreId: filters.genreId,
         sortBy: filters.sortBy,
         minRating: filters.minRating,
         maxRating: filters.maxRating,
      },
   });
}

/** Fetch watch providers for a movie */
export function fetchMovieWatchProviders(movieId: number): Promise<WatchProviderResponse> {
   return fetchAPI<WatchProviderResponse>(`/movies/${movieId}/providers`);
}
