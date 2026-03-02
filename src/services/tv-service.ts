import type {
   TVShow,
   TVShowDetail,
   Credits,
   VideosResponse,
   TMDBResponse,
   TVCategory,
   WatchProviderResponse,
} from '@/types';
import type { DiscoverFilters } from '@/types';
import { fetchAPI } from '@/lib/api-client';

const CATEGORY_PATH: Record<TVCategory, string> = {
   popular: '/tv/popular',
   top_rated: '/tv/top-rated',
   airing_today: '/tv/airing-today',
   on_the_air: '/tv/on-the-air',
};

/** Fetch trending TV shows (week) */
export function fetchTrendingTV(page = 1): Promise<TMDBResponse<TVShow>> {
   return fetchAPI<TMDBResponse<TVShow>>('/tv/trending', { params: { page } });
}

/** Fetch TV shows by category */
export function fetchTVByCategory(category: TVCategory, page = 1): Promise<TMDBResponse<TVShow>> {
   const path = CATEGORY_PATH[category] ?? '/tv/popular';
   return fetchAPI<TMDBResponse<TVShow>>(path, { params: { page } });
}

/** Fetch popular TV shows */
export function fetchPopularTV(page = 1): Promise<TMDBResponse<TVShow>> {
   return fetchAPI<TMDBResponse<TVShow>>('/tv/popular', { params: { page } });
}

/** Fetch airing today TV shows */
export function fetchAiringTodayTV(page = 1): Promise<TMDBResponse<TVShow>> {
   return fetchAPI<TMDBResponse<TVShow>>('/tv/airing-today', { params: { page } });
}

/** Fetch top rated TV shows */
export function fetchTopRatedTV(page = 1): Promise<TMDBResponse<TVShow>> {
   return fetchAPI<TMDBResponse<TVShow>>('/tv/top-rated', { params: { page } });
}

/** Fetch on the air TV shows */
export function fetchOnTheAirTV(page = 1): Promise<TMDBResponse<TVShow>> {
   return fetchAPI<TMDBResponse<TVShow>>('/tv/on-the-air', { params: { page } });
}

/** Fetch TV show detail by ID */
export function fetchTVDetail(tvId: number): Promise<TVShowDetail> {
   return fetchAPI<TVShowDetail>(`/tv/${tvId}`);
}

/** Fetch TV show credits */
export function fetchTVCredits(tvId: number): Promise<Credits> {
   return fetchAPI<Credits>(`/tv/${tvId}/credits`);
}

/** Fetch TV show videos */
export function fetchTVVideos(tvId: number): Promise<VideosResponse> {
   return fetchAPI<VideosResponse>(`/tv/${tvId}/videos`);
}

/** Fetch similar TV shows */
export function fetchSimilarTV(tvId: number, page = 1): Promise<TMDBResponse<TVShow>> {
   return fetchAPI<TMDBResponse<TVShow>>(`/tv/${tvId}/similar`, { params: { page } });
}

/** Fetch TV shows by genre */
export function fetchTVByGenre(genreId: number, page = 1): Promise<TMDBResponse<TVShow>> {
   return fetchAPI<TMDBResponse<TVShow>>(`/tv/genre/${genreId}`, { params: { page } });
}

/** Discover TV shows with advanced filters */
export function discoverTV(filters: DiscoverFilters, page = 1): Promise<TMDBResponse<TVShow>> {
   return fetchAPI<TMDBResponse<TVShow>>('/tv/discover', {
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

/** Fetch watch providers for a TV show */
export function fetchTVWatchProviders(tvId: number): Promise<WatchProviderResponse> {
   return fetchAPI<WatchProviderResponse>(`/tv/${tvId}/providers`);
}
