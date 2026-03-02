import { Injectable } from '@nestjs/common';
import { TmdbService } from '@/modules/tmdb';
import type {
   Movie,
   MovieDetail,
   Credits,
   VideosResponse,
   TMDBResponse,
   MovieCategory,
   WatchProviderResponse,
   DiscoverFilters,
} from '@/types';

@Injectable()
export class MoviesService {
   constructor(private readonly tmdb: TmdbService) {}

   /** Fetch trending movies (week) */
   fetchTrending(page = 1): Promise<TMDBResponse<Movie>> {
      return this.tmdb.fetch<TMDBResponse<Movie>>('/trending/movie/week', { page: String(page) });
   }

   /** Fetch movies by category */
   fetchByCategory(category: MovieCategory, page = 1): Promise<TMDBResponse<Movie>> {
      return this.tmdb.fetch<TMDBResponse<Movie>>(`/movie/${category}`, { page: String(page) });
   }

   /** Fetch movie detail by ID */
   fetchDetail(movieId: number): Promise<MovieDetail> {
      return this.tmdb.fetch<MovieDetail>(`/movie/${movieId}`);
   }

   /** Fetch movie credits (cast & crew) */
   fetchCredits(movieId: number): Promise<Credits> {
      return this.tmdb.fetch<Credits>(`/movie/${movieId}/credits`);
   }

   /** Fetch movie videos (trailers, etc.) */
   fetchVideos(movieId: number): Promise<VideosResponse> {
      return this.tmdb.fetch<VideosResponse>(`/movie/${movieId}/videos`, { language: 'en-US' });
   }

   /** Fetch similar movies */
   fetchSimilar(movieId: number, page = 1): Promise<TMDBResponse<Movie>> {
      return this.tmdb.fetch<TMDBResponse<Movie>>(`/movie/${movieId}/similar`, { page: String(page) });
   }

   /** Fetch movies by genre */
   fetchByGenre(genreId: number, page = 1): Promise<TMDBResponse<Movie>> {
      return this.tmdb.fetch<TMDBResponse<Movie>>('/discover/movie', {
         with_genres: String(genreId),
         sort_by: 'popularity.desc',
         page: String(page),
      });
   }

   /** Discover movies with advanced filters */
   discover(filters: DiscoverFilters, page = 1): Promise<TMDBResponse<Movie>> {
      const params: Record<string, string> = {
         page: String(page),
         sort_by: filters.sortBy ?? 'popularity.desc',
      };

      if (filters.year) params['primary_release_year'] = String(filters.year);
      if (filters.genreId) params['with_genres'] = String(filters.genreId);
      if (filters.minRating) params['vote_average.gte'] = String(filters.minRating);
      if (filters.maxRating) params['vote_average.lte'] = String(filters.maxRating);

      return this.tmdb.fetch<TMDBResponse<Movie>>('/discover/movie', params);
   }

   /** Fetch watch providers for a movie */
   fetchWatchProviders(movieId: number): Promise<WatchProviderResponse> {
      return this.tmdb.fetch<WatchProviderResponse>(`/movie/${movieId}/watch/providers`);
   }
}
