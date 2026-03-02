import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/** TMDB API base URL */
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

/**
 * Shared TMDB API client service.
 * Handles authentication, error handling, and request construction.
 */
@Injectable()
export class TmdbService {
   private readonly logger = new Logger(TmdbService.name);
   private readonly apiKey: string;

   constructor(private readonly config: ConfigService) {
      const key = this.config.get<string>('tmdb.apiKey');
      if (!key) {
         throw new Error('TMDB_API_KEY is not set. Get one at https://www.themoviedb.org/settings/api');
      }
      this.apiKey = key;
   }

   /**
    * Fetch data from TMDB API.
    * @param endpoint - API endpoint (e.g. '/movie/popular')
    * @param params - Additional query parameters
    * @returns Parsed JSON response
    * @throws Error on non-OK HTTP response
    */
   async fetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
      const searchParams = new URLSearchParams({
         api_key: this.apiKey,
         language: 'vi-VN',
         ...params,
      });

      const url = `${TMDB_BASE_URL}${endpoint}?${searchParams.toString()}`;

      const response = await fetch(url);

      if (!response.ok) {
         const errorMessage = `TMDB API error: ${response.status} ${response.statusText} for ${endpoint}`;
         this.logger.error(errorMessage);
         throw new Error(errorMessage);
      }

      return response.json() as Promise<T>;
   }
}
