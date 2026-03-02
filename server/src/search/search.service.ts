import { Injectable } from '@nestjs/common';
import { TmdbService } from '@/tmdb';
import type { Movie, TVShow, Genre, TMDBResponse } from '@/types';

@Injectable()
export class SearchService {
   constructor(private readonly tmdb: TmdbService) {}

   /** Search movies by query */
   searchMovies(query: string, page = 1): Promise<TMDBResponse<Movie>> {
      return this.tmdb.fetch<TMDBResponse<Movie>>('/search/movie', {
         query,
         page: String(page),
         include_adult: 'false',
      });
   }

   /** Search TV shows by query */
   searchTV(query: string, page = 1): Promise<TMDBResponse<TVShow>> {
      return this.tmdb.fetch<TMDBResponse<TVShow>>('/search/tv', {
         query,
         page: String(page),
         include_adult: 'false',
      });
   }

   /** Search multi (movies + TV) */
   searchMulti(query: string, page = 1): Promise<TMDBResponse<Movie | TVShow>> {
      return this.tmdb.fetch<TMDBResponse<Movie | TVShow>>('/search/multi', {
         query,
         page: String(page),
         include_adult: 'false',
      });
   }
}
