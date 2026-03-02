import { Injectable } from '@nestjs/common';
import { TmdbService } from '@/tmdb';
import type {
   TVShow,
   TVShowDetail,
   Credits,
   VideosResponse,
   TMDBResponse,
   TVCategory,
   WatchProviderResponse,
   DiscoverFilters,
} from '@/types';

@Injectable()
export class TvService {
   constructor(private readonly tmdb: TmdbService) {}

   /** Fetch trending TV shows (week) */
   fetchTrending(page = 1): Promise<TMDBResponse<TVShow>> {
      return this.tmdb.fetch<TMDBResponse<TVShow>>('/trending/tv/week', { page: String(page) });
   }

   /** Fetch TV shows by category */
   fetchByCategory(category: TVCategory, page = 1): Promise<TMDBResponse<TVShow>> {
      return this.tmdb.fetch<TMDBResponse<TVShow>>(`/tv/${category}`, { page: String(page) });
   }

   /** Fetch TV show detail by ID */
   fetchDetail(tvId: number): Promise<TVShowDetail> {
      return this.tmdb.fetch<TVShowDetail>(`/tv/${tvId}`);
   }

   /** Fetch TV show credits */
   fetchCredits(tvId: number): Promise<Credits> {
      return this.tmdb.fetch<Credits>(`/tv/${tvId}/credits`);
   }

   /** Fetch TV show videos */
   fetchVideos(tvId: number): Promise<VideosResponse> {
      return this.tmdb.fetch<VideosResponse>(`/tv/${tvId}/videos`, { language: 'en-US' });
   }

   /** Fetch similar TV shows */
   fetchSimilar(tvId: number, page = 1): Promise<TMDBResponse<TVShow>> {
      return this.tmdb.fetch<TMDBResponse<TVShow>>(`/tv/${tvId}/similar`, { page: String(page) });
   }

   /** Fetch TV shows by genre */
   fetchByGenre(genreId: number, page = 1): Promise<TMDBResponse<TVShow>> {
      return this.tmdb.fetch<TMDBResponse<TVShow>>('/discover/tv', {
         with_genres: String(genreId),
         sort_by: 'popularity.desc',
         page: String(page),
      });
   }

   /** Discover TV shows with advanced filters */
   discover(filters: DiscoverFilters, page = 1): Promise<TMDBResponse<TVShow>> {
      const params: Record<string, string> = {
         page: String(page),
         sort_by: filters.sortBy ?? 'popularity.desc',
      };

      if (filters.year) params['first_air_date_year'] = String(filters.year);
      if (filters.genreId) params['with_genres'] = String(filters.genreId);
      if (filters.minRating) params['vote_average.gte'] = String(filters.minRating);
      if (filters.maxRating) params['vote_average.lte'] = String(filters.maxRating);

      return this.tmdb.fetch<TMDBResponse<TVShow>>('/discover/tv', params);
   }

   /** Fetch watch providers for a TV show */
   fetchWatchProviders(tvId: number): Promise<WatchProviderResponse> {
      return this.tmdb.fetch<WatchProviderResponse>(`/tv/${tvId}/watch/providers`);
   }
}
