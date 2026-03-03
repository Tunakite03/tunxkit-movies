import { fetchAPI } from '@/lib/api-client';
import type { TMDBResponse } from '@/types';

// ─── Dashboard Stats ────────────────────────────────────────

export interface DashboardStats {
   readonly users: number;
   readonly movies: number;
   readonly tvShows: number;
   readonly people: number;
   readonly genres: number;
   readonly movieVideos: number;
   readonly tvVideos: number;
   readonly watchlistItems: number;
   readonly recentUsers: readonly AdminUser[];
   readonly recentMovies: readonly AdminMovieItem[];
}

// ─── Admin User ─────────────────────────────────────────────

export interface AdminUser {
   readonly id: string;
   readonly name: string | null;
   readonly email: string;
   readonly image: string | null;
   readonly role: string;
   readonly createdAt: string;
   readonly _count: {
      readonly watchlist: number;
   };
}

// ─── Admin Movie ────────────────────────────────────────────

export interface AdminMovieItem {
   readonly id: number;
   readonly title: string;
   readonly posterPath: string | null;
   readonly releaseDate: string;
   readonly voteAverage: number;
   readonly popularity: number;
   readonly status: string;
   readonly _count: {
      readonly cast: number;
      readonly videos: number;
   };
}

// ─── Admin TV Show ──────────────────────────────────────────

export interface AdminTVShowItem {
   readonly id: number;
   readonly name: string;
   readonly posterPath: string | null;
   readonly firstAirDate: string;
   readonly voteAverage: number;
   readonly popularity: number;
   readonly numberOfSeasons: number;
   readonly numberOfEpisodes: number;
   readonly status: string;
   readonly _count: {
      readonly cast: number;
      readonly videos: number;
   };
}

// ─── Admin Person ───────────────────────────────────────────

export interface AdminPersonItem {
   readonly id: number;
   readonly name: string;
   readonly profilePath: string | null;
   readonly knownForDepartment: string;
   readonly popularity: number;
   readonly _count: {
      readonly movieCast: number;
      readonly tvCast: number;
   };
}

// ─── Admin Genre ────────────────────────────────────────────

export interface AdminGenreItem {
   readonly id: number;
   readonly name: string;
   readonly _count: {
      readonly movies?: number;
      readonly tvShows?: number;
   };
}

export interface AdminGenresResponse {
   readonly movieGenres: readonly AdminGenreItem[];
   readonly tvGenres: readonly AdminGenreItem[];
}

// ─── Import (existing) ─────────────────────────────────────

export interface AdminStats {
   readonly movies: number;
   readonly tvShows: number;
   readonly people: number;
   readonly genres: number;
   readonly videos: number;
   readonly tvVideos: number;
}

export interface ImportResponse {
   readonly message?: string;
   readonly movies?: number;
   readonly tvShows?: number;
   readonly people?: number;
   readonly peopleImported?: number;
}

// ─── API Functions ──────────────────────────────────────────

/** Get dashboard stats */
export function getDashboardStats(token: string): Promise<DashboardStats> {
   return fetchAPI<DashboardStats>('/admin/dashboard', { token, cache: 'no-store' });
}

/** List users with search/pagination */
export function getAdminUsers(
   token: string,
   page = 1,
   search?: string,
): Promise<TMDBResponse<AdminUser>> {
   return fetchAPI<TMDBResponse<AdminUser>>('/admin/users', {
      token,
      params: { page, search },
      cache: 'no-store',
   });
}

/** Update user role */
export function updateUserRole(
   userId: string,
   role: 'USER' | 'ADMIN',
   token: string,
): Promise<{ message: string }> {
   return fetchAPI<{ message: string }>(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: { role },
      token,
   });
}

/** Delete a user */
export function deleteAdminUser(userId: string, token: string): Promise<{ message: string }> {
   return fetchAPI<{ message: string }>(`/admin/users/${userId}`, {
      method: 'DELETE',
      token,
   });
}

/** List movies with search/pagination */
export function getAdminMovies(
   token: string,
   page = 1,
   search?: string,
): Promise<TMDBResponse<AdminMovieItem>> {
   return fetchAPI<TMDBResponse<AdminMovieItem>>('/admin/movies', {
      token,
      params: { page, search },
      cache: 'no-store',
   });
}

/** Delete a movie */
export function deleteAdminMovie(movieId: number, token: string): Promise<{ message: string }> {
   return fetchAPI<{ message: string }>(`/admin/movies/${movieId}`, {
      method: 'DELETE',
      token,
   });
}

/** List TV shows with search/pagination */
export function getAdminTVShows(
   token: string,
   page = 1,
   search?: string,
): Promise<TMDBResponse<AdminTVShowItem>> {
   return fetchAPI<TMDBResponse<AdminTVShowItem>>('/admin/tv-shows', {
      token,
      params: { page, search },
      cache: 'no-store',
   });
}

/** Delete a TV show */
export function deleteAdminTVShow(tvShowId: number, token: string): Promise<{ message: string }> {
   return fetchAPI<{ message: string }>(`/admin/tv-shows/${tvShowId}`, {
      method: 'DELETE',
      token,
   });
}

/** List people with search/pagination */
export function getAdminPeople(
   token: string,
   page = 1,
   search?: string,
): Promise<TMDBResponse<AdminPersonItem>> {
   return fetchAPI<TMDBResponse<AdminPersonItem>>('/admin/people', {
      token,
      params: { page, search },
      cache: 'no-store',
   });
}

/** List all genres */
export function getAdminGenres(token: string): Promise<AdminGenresResponse> {
   return fetchAPI<AdminGenresResponse>('/admin/genres', { token, cache: 'no-store' });
}

// ─── Import functions (moved from old admin-service) ────────

/** Get database content stats */
export function getAdminStats(token: string): Promise<AdminStats> {
   return fetchAPI<AdminStats>('/import/stats', { token });
}

/** Import all TMDB data */
export function importAll(pages: number = 5, token: string): Promise<ImportResponse> {
   return fetchAPI<ImportResponse>('/import/all', {
      method: 'POST',
      params: { pages },
      token,
   });
}

/** Import only genres */
export function importGenres(token: string): Promise<ImportResponse> {
   return fetchAPI<ImportResponse>('/import/genres', {
      method: 'POST',
      token,
   });
}

/** Import a single movie by ID */
export function importMovie(tmdbId: number, token: string): Promise<ImportResponse> {
   return fetchAPI<ImportResponse>(`/import/movie/${tmdbId}`, {
      method: 'POST',
      token,
   });
}

/** Import a single TV show by ID */
export function importTV(tmdbId: number, token: string): Promise<ImportResponse> {
   return fetchAPI<ImportResponse>(`/import/tv/${tmdbId}`, {
      method: 'POST',
      token,
   });
}
