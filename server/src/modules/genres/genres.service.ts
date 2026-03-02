import { Injectable } from '@nestjs/common';
import { TmdbService } from '@/modules/tmdb';
import type { Genre } from '@/types';

@Injectable()
export class GenresService {
   constructor(private readonly tmdb: TmdbService) {}

   /** Fetch all movie genres */
   async fetchMovieGenres(): Promise<readonly Genre[]> {
      const data = await this.tmdb.fetch<{ genres: Genre[] }>('/genre/movie/list');
      return data.genres;
   }

   /** Fetch all TV show genres */
   async fetchTVGenres(): Promise<readonly Genre[]> {
      const data = await this.tmdb.fetch<{ genres: Genre[] }>('/genre/tv/list');
      return data.genres;
   }
}
