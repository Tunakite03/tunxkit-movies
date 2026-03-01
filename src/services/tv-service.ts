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
import { fetchTMDB } from './tmdb-client';

/** Fetch trending TV shows (week) */
export function fetchTrendingTV(page = 1): Promise<TMDBResponse<TVShow>> {
   return fetchTMDB<TMDBResponse<TVShow>>('/trending/tv/week', {
      page: String(page),
   });
}

/** Fetch TV shows by category */
export function fetchTVByCategory(category: TVCategory, page = 1): Promise<TMDBResponse<TVShow>> {
   return fetchTMDB<TMDBResponse<TVShow>>(`/tv/${category}`, {
      page: String(page),
   });
}

/** Fetch popular TV shows */
export function fetchPopularTV(page = 1): Promise<TMDBResponse<TVShow>> {
   return fetchTVByCategory('popular', page);
}

/** Fetch airing today TV shows */
export function fetchAiringTodayTV(page = 1): Promise<TMDBResponse<TVShow>> {
   return fetchTVByCategory('airing_today', page);
}

/** Fetch top rated TV shows */
export function fetchTopRatedTV(page = 1): Promise<TMDBResponse<TVShow>> {
   return fetchTVByCategory('top_rated', page);
}

/** Fetch on the air TV shows */
export function fetchOnTheAirTV(page = 1): Promise<TMDBResponse<TVShow>> {
   return fetchTVByCategory('on_the_air', page);
}

/** Fetch TV show detail by ID */
export function fetchTVDetail(tvId: number): Promise<TVShowDetail> {
   return fetchTMDB<TVShowDetail>(`/tv/${tvId}`);
}

/** Fetch TV show credits */
export function fetchTVCredits(tvId: number): Promise<Credits> {
   return fetchTMDB<Credits>(`/tv/${tvId}/credits`);
}

/** Fetch TV show videos */
export function fetchTVVideos(tvId: number): Promise<VideosResponse> {
   return fetchTMDB<VideosResponse>(`/tv/${tvId}/videos`, {
      language: 'en-US',
   });
}

/** Fetch similar TV shows */
export function fetchSimilarTV(tvId: number, page = 1): Promise<TMDBResponse<TVShow>> {
   return fetchTMDB<TMDBResponse<TVShow>>(`/tv/${tvId}/similar`, {
      page: String(page),
   });
}

/** Fetch TV shows by genre */
export function fetchTVByGenre(genreId: number, page = 1): Promise<TMDBResponse<TVShow>> {
   return fetchTMDB<TMDBResponse<TVShow>>('/discover/tv', {
      with_genres: String(genreId),
      sort_by: 'popularity.desc',
      page: String(page),
   });
}

/** Discover TV shows with advanced filters */
export function discoverTV(filters: DiscoverFilters, page = 1): Promise<TMDBResponse<TVShow>> {
   const params: Record<string, string> = {
      page: String(page),
      sort_by: filters.sortBy ?? 'popularity.desc',
   };

   if (filters.year) params.first_air_date_year = String(filters.year);
   if (filters.genreId) params.with_genres = String(filters.genreId);
   if (filters.minRating) params['vote_average.gte'] = String(filters.minRating);
   if (filters.maxRating) params['vote_average.lte'] = String(filters.maxRating);

   return fetchTMDB<TMDBResponse<TVShow>>('/discover/tv', params);
}

/** Fetch watch providers for a TV show */
export function fetchTVWatchProviders(tvId: number): Promise<WatchProviderResponse> {
   return fetchTMDB<WatchProviderResponse>(`/tv/${tvId}/watch/providers`);
}
