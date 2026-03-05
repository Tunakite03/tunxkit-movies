import { fetchAPI } from '@/lib/api-client';
import type { TMDBResponse } from '@/types';

// ─── Dashboard Stats ────────────────────────────────────────

export interface StatusCount {
   readonly status: string;
   readonly _count: number;
}

export interface GenrePopularity {
   readonly id: number;
   readonly name: string;
   readonly count: number;
}

export interface DashboardStats {
   readonly users: number;
   readonly movies: number;
   readonly tvShows: number;
   readonly people: number;
   readonly genres: number;
   readonly movieVideos: number;
   readonly tvVideos: number;
   readonly watchlistItems: number;
   readonly videoSources: number;
   readonly activeVideoSources: number;
   readonly recentUsers: readonly AdminUser[];
   readonly recentMovies: readonly AdminMovieItem[];
   readonly recentTVShows: readonly AdminTVShowItem[];
   readonly topRatedMovies: readonly AdminMovieItem[];
   readonly topRatedTVShows: readonly AdminTVShowItem[];
   readonly moviesByStatus: readonly StatusCount[];
   readonly tvShowsByStatus: readonly StatusCount[];
   readonly popularMovieGenres: readonly GenrePopularity[];
   readonly popularTVGenres: readonly GenrePopularity[];
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

// ─── Admin User Detail ──────────────────────────────────────

export interface AdminUserDetail {
   readonly id: string;
   readonly name: string | null;
   readonly email: string;
   readonly image: string | null;
   readonly role: string;
   readonly emailVerified: string | null;
   readonly createdAt: string;
   readonly updatedAt: string;
   readonly _count: {
      readonly watchlist: number;
      readonly accounts: number;
   };
}

export interface UpdateUserData {
   readonly name?: string;
   readonly email?: string;
   readonly image?: string;
   readonly role?: 'USER' | 'ADMIN';
}

export interface CreateUserData {
   readonly email: string;
   readonly password: string;
   readonly name?: string;
   readonly role?: 'USER' | 'ADMIN';
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

// ─── Admin Movie Detail ─────────────────────────────────────

export interface AdminMovieDetailCast {
   readonly id: string;
   readonly character: string;
   readonly castOrder: number;
   readonly person: {
      readonly id: number;
      readonly name: string;
      readonly profilePath: string | null;
   };
}

export interface AdminVideoItem {
   readonly id: string;
   readonly key: string;
   readonly name: string;
   readonly site: string;
   readonly type: string;
   readonly official: boolean;
}

export interface AdminMovieDetail {
   readonly id: number;
   readonly title: string;
   readonly originalTitle: string;
   readonly tagline: string;
   readonly overview: string;
   readonly posterPath: string | null;
   readonly backdropPath: string | null;
   readonly releaseDate: string;
   readonly voteAverage: number;
   readonly voteCount: number;
   readonly popularity: number;
   readonly adult: boolean;
   readonly runtime: number;
   readonly status: string;
   readonly budget: number;
   readonly revenue: number;
   readonly genres: readonly { genre: { id: number; name: string } }[];
   readonly cast: readonly AdminMovieDetailCast[];
   readonly videos: readonly AdminVideoItem[];
}

// ─── Admin TV Show Detail ───────────────────────────────────

export interface AdminTVShowDetailCast {
   readonly id: string;
   readonly character: string;
   readonly castOrder: number;
   readonly person: {
      readonly id: number;
      readonly name: string;
      readonly profilePath: string | null;
   };
}

export interface AdminSeasonItem {
   readonly id: number;
   readonly seasonNumber: number;
   readonly name: string;
   readonly episodeCount: number;
   readonly airDate: string | null;
}

export interface AdminTVShowDetail {
   readonly id: number;
   readonly name: string;
   readonly originalName: string;
   readonly tagline: string;
   readonly overview: string;
   readonly posterPath: string | null;
   readonly backdropPath: string | null;
   readonly firstAirDate: string;
   readonly lastAirDate: string;
   readonly voteAverage: number;
   readonly voteCount: number;
   readonly popularity: number;
   readonly adult: boolean;
   readonly numberOfSeasons: number;
   readonly numberOfEpisodes: number;
   readonly status: string;
   readonly genres: readonly { genre: { id: number; name: string } }[];
   readonly cast: readonly AdminTVShowDetailCast[];
   readonly videos: readonly AdminVideoItem[];
   readonly seasons: readonly AdminSeasonItem[];
}

// ─── Update DTOs ────────────────────────────────────────────

export interface UpdateMovieData {
   readonly title?: string;
   readonly overview?: string;
   readonly tagline?: string;
   readonly posterPath?: string;
   readonly backdropPath?: string;
   readonly status?: string;
   readonly releaseDate?: string;
   readonly voteAverage?: number;
   readonly runtime?: number;
   readonly adult?: boolean;
}

export interface UpdateTVShowData {
   readonly name?: string;
   readonly overview?: string;
   readonly tagline?: string;
   readonly status?: string;
   readonly firstAirDate?: string;
   readonly voteAverage?: number;
   readonly numberOfSeasons?: number;
   readonly numberOfEpisodes?: number;
}

// ─── Create Data Types ──────────────────────────────────────

export interface CreateMovieData {
   readonly id: number;
   readonly title: string;
   readonly originalTitle?: string;
   readonly tagline?: string;
   readonly overview?: string;
   readonly posterPath?: string;
   readonly backdropPath?: string;
   readonly releaseDate?: string;
   readonly voteAverage?: number;
   readonly runtime?: number;
   readonly status?: string;
   readonly adult?: boolean;
   readonly genreIds?: readonly number[];
}

export interface CreateTVShowData {
   readonly id: number;
   readonly name: string;
   readonly originalName?: string;
   readonly tagline?: string;
   readonly overview?: string;
   readonly posterPath?: string;
   readonly backdropPath?: string;
   readonly firstAirDate?: string;
   readonly voteAverage?: number;
   readonly numberOfSeasons?: number;
   readonly numberOfEpisodes?: number;
   readonly status?: string;
   readonly genreIds?: readonly number[];
}

export interface CreateGenreData {
   readonly id: number;
   readonly name: string;
   readonly type: 'movie' | 'tv';
}

export interface UpdateGenreData {
   readonly name?: string;
}

export interface CreatePersonData {
   readonly id: number;
   readonly name: string;
   readonly biography?: string;
   readonly birthday?: string;
   readonly deathday?: string;
   readonly placeOfBirth?: string;
   readonly profilePath?: string;
   readonly knownForDepartment?: string;
   readonly gender?: number;
}

export interface UpdatePersonData {
   readonly name?: string;
   readonly biography?: string;
   readonly birthday?: string;
   readonly deathday?: string;
   readonly placeOfBirth?: string;
   readonly profilePath?: string;
   readonly knownForDepartment?: string;
   readonly gender?: number;
}

export interface CreateVideoData {
   readonly key: string;
   readonly name: string;
   readonly site?: string;
   readonly type?: string;
   readonly official?: boolean;
}

export interface AdminPersonDetail {
   readonly id: number;
   readonly name: string;
   readonly biography: string;
   readonly birthday: string | null;
   readonly deathday: string | null;
   readonly placeOfBirth: string | null;
   readonly profilePath: string | null;
   readonly knownForDepartment: string;
   readonly gender: number;
   readonly popularity: number;
   readonly homepage: string | null;
   readonly imdbId: string | null;
   readonly alsoKnownAs: readonly string[];
   readonly _count: {
      readonly movieCast: number;
      readonly tvCast: number;
   };
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

/** Get user detail for admin */
export function getAdminUserDetail(userId: string, token: string): Promise<AdminUserDetail> {
   return fetchAPI<AdminUserDetail>(`/admin/users/${userId}`, { token, cache: 'no-store' });
}

/** Update a user */
export function updateAdminUser(
   userId: string,
   data: UpdateUserData,
   token: string,
): Promise<{ message: string }> {
   return fetchAPI<{ message: string }>(`/admin/users/${userId}`, {
      method: 'PATCH',
      body: data,
      token,
   });
}

/** Create a new user */
export function createAdminUser(
   data: CreateUserData,
   token: string,
): Promise<{ message: string; id: string }> {
   return fetchAPI<{ message: string; id: string }>('/admin/users', {
      method: 'POST',
      body: data,
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

/** Create a movie manually */
export function createAdminMovie(
   data: CreateMovieData,
   token: string,
): Promise<{ message: string; id: number }> {
   return fetchAPI<{ message: string; id: number }>('/admin/movies', {
      method: 'POST',
      body: data,
      token,
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

/** Create a TV show manually */
export function createAdminTVShow(
   data: CreateTVShowData,
   token: string,
): Promise<{ message: string; id: number }> {
   return fetchAPI<{ message: string; id: number }>('/admin/tv-shows', {
      method: 'POST',
      body: data,
      token,
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

/** Create a genre manually */
export function createAdminGenre(
   data: CreateGenreData,
   token: string,
): Promise<{ message: string; id: number }> {
   return fetchAPI<{ message: string; id: number }>('/admin/genres', {
      method: 'POST',
      body: data,
      token,
   });
}

/** Update a genre */
export function updateAdminGenre(
   genreId: number,
   data: UpdateGenreData,
   token: string,
): Promise<{ message: string }> {
   return fetchAPI<{ message: string }>(`/admin/genres/${genreId}`, {
      method: 'PATCH',
      body: data,
      token,
   });
}

/** Delete a genre */
export function deleteAdminGenre(genreId: number, token: string): Promise<{ message: string }> {
   return fetchAPI<{ message: string }>(`/admin/genres/${genreId}`, {
      method: 'DELETE',
      token,
   });
}

// ─── Movie Detail & Update ──────────────────────────────────

/** Get movie detail for admin */
export function getAdminMovieDetail(movieId: number, token: string): Promise<AdminMovieDetail> {
   return fetchAPI<AdminMovieDetail>(`/admin/movies/${movieId}`, { token, cache: 'no-store' });
}

/** Update a movie */
export function updateAdminMovie(
   movieId: number,
   data: UpdateMovieData,
   token: string,
): Promise<{ message: string }> {
   return fetchAPI<{ message: string }>(`/admin/movies/${movieId}`, {
      method: 'PATCH',
      body: data,
      token,
   });
}

// ─── TV Show Detail & Update ────────────────────────────────

/** Get TV show detail for admin */
export function getAdminTVShowDetail(tvShowId: number, token: string): Promise<AdminTVShowDetail> {
   return fetchAPI<AdminTVShowDetail>(`/admin/tv-shows/${tvShowId}`, { token, cache: 'no-store' });
}

/** Update a TV show */
export function updateAdminTVShow(
   tvShowId: number,
   data: UpdateTVShowData,
   token: string,
): Promise<{ message: string }> {
   return fetchAPI<{ message: string }>(`/admin/tv-shows/${tvShowId}`, {
      method: 'PATCH',
      body: data,
      token,
   });
}

export interface CreateTVSeasonData {
   readonly name: string;
   readonly seasonNumber: number;
   readonly episodeCount: number;
   readonly airDate?: string;
}

export interface UpdateTVSeasonData {
   readonly name?: string;
   readonly seasonNumber?: number;
   readonly episodeCount?: number;
   readonly airDate?: string;
}

/** Quick-create a season for a TV show */
export function createAdminTVSeason(
   tvShowId: number,
   data: CreateTVSeasonData,
   token: string,
): Promise<{ message: string; id: number }> {
   return fetchAPI<{ message: string; id: number }>(`/admin/tv-shows/${tvShowId}/seasons`, {
      method: 'POST',
      body: data,
      token,
   });
}

/** Update a TV season */
export function updateAdminTVSeason(
   tvShowId: number,
   seasonId: number,
   data: UpdateTVSeasonData,
   token: string,
): Promise<{ message: string }> {
   return fetchAPI<{ message: string }>(`/admin/tv-shows/${tvShowId}/seasons/${seasonId}`, {
      method: 'PATCH',
      body: data,
      token,
   });
}

/** Delete a TV season */
export function deleteAdminTVSeason(
   tvShowId: number,
   seasonId: number,
   token: string,
): Promise<{ message: string }> {
   return fetchAPI<{ message: string }>(`/admin/tv-shows/${tvShowId}/seasons/${seasonId}`, {
      method: 'DELETE',
      token,
   });
}

// ─── Video Management ───────────────────────────────────────

/** Delete a movie video */
export function deleteAdminVideo(videoId: string, token: string): Promise<{ message: string }> {
   return fetchAPI<{ message: string }>(`/admin/videos/${videoId}`, {
      method: 'DELETE',
      token,
   });
}

/** Add a video to a movie */
export function createAdminMovieVideo(
   movieId: number,
   data: CreateVideoData,
   token: string,
): Promise<{ message: string; id: string }> {
   return fetchAPI<{ message: string; id: string }>(`/admin/movies/${movieId}/videos`, {
      method: 'POST',
      body: data,
      token,
   });
}

/** Add a video to a TV show */
export function createAdminTVShowVideo(
   tvShowId: number,
   data: CreateVideoData,
   token: string,
): Promise<{ message: string; id: string }> {
   return fetchAPI<{ message: string; id: string }>(`/admin/tv-shows/${tvShowId}/videos`, {
      method: 'POST',
      body: data,
      token,
   });
}

/** Delete a TV video */
export function deleteAdminTVVideo(videoId: string, token: string): Promise<{ message: string }> {
   return fetchAPI<{ message: string }>(`/admin/tv-videos/${videoId}`, {
      method: 'DELETE',
      token,
   });
}

// ─── People Management ─────────────────────────────────────

/** Create a person manually */
export function createAdminPerson(
   data: CreatePersonData,
   token: string,
): Promise<{ message: string; id: number }> {
   return fetchAPI<{ message: string; id: number }>('/admin/people', {
      method: 'POST',
      body: data,
      token,
   });
}

/** Get person detail for admin */
export function getAdminPersonDetail(personId: number, token: string): Promise<AdminPersonDetail> {
   return fetchAPI<AdminPersonDetail>(`/admin/people/${personId}`, { token, cache: 'no-store' });
}

/** Update a person */
export function updateAdminPerson(
   personId: number,
   data: UpdatePersonData,
   token: string,
): Promise<{ message: string }> {
   return fetchAPI<{ message: string }>(`/admin/people/${personId}`, {
      method: 'PATCH',
      body: data,
      token,
   });
}

/** Delete a person */
export function deleteAdminPerson(personId: number, token: string): Promise<{ message: string }> {
   return fetchAPI<{ message: string }>(`/admin/people/${personId}`, {
      method: 'DELETE',
      token,
   });
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

// ─── Cast Management ────────────────────────────────────────

export interface AddCastData {
   readonly personId: number;
   readonly character?: string;
   readonly castOrder?: number;
}

export interface PersonSearchResult {
   readonly id: number;
   readonly name: string;
   readonly profilePath: string | null;
}

export interface TmdbMovieSearchResult {
   readonly id: number;
   readonly title: string;
   readonly posterPath: string | null;
   readonly releaseDate: string;
}

export interface TmdbTvSearchResult {
   readonly id: number;
   readonly name: string;
   readonly posterPath: string | null;
   readonly firstAirDate: string;
}

export interface TmdbSearchResponse<T> {
   readonly page: number;
   readonly results: readonly T[];
   readonly total_pages: number;
   readonly total_results: number;
}

/** Search TMDB movies (for quick-add source picker) */
export function searchTmdbMovies(
   query: string,
   page: number,
   token: string,
): Promise<TmdbSearchResponse<TmdbMovieSearchResult>> {
   return fetchAPI<TmdbSearchResponse<TmdbMovieSearchResult>>('/admin/tmdb-search/movies', {
      token,
      params: { q: query, page },
      cache: 'no-store',
   });
}

/** Search TMDB TV shows (for quick-add source picker) */
export function searchTmdbTv(
   query: string,
   page: number,
   token: string,
): Promise<TmdbSearchResponse<TmdbTvSearchResult>> {
   return fetchAPI<TmdbSearchResponse<TmdbTvSearchResult>>('/admin/tmdb-search/tv', {
      token,
      params: { q: query, page },
      cache: 'no-store',
   });
}

/** Fetch TV show seasons directly from TMDB (read-only, no DB writes) */
export interface TmdbTVSeasonsResponse {
   readonly id: number;
   readonly name: string;
   readonly seasons: readonly AdminSeasonItem[];
}

export function getTmdbTVSeasons(tvShowId: number, token: string): Promise<TmdbTVSeasonsResponse> {
   return fetchAPI<TmdbTVSeasonsResponse>(`/admin/tmdb-search/tv/${tvShowId}/seasons`, {
      token,
      cache: 'no-store',
   });
}

/** Search people for cast auto-complete */
export function searchAdminPeople(
   query: string,
   token: string,
): Promise<readonly PersonSearchResult[]> {
   return fetchAPI<readonly PersonSearchResult[]>('/admin/people/search', {
      token,
      params: { q: query },
      cache: 'no-store',
   });
}

/** Add a cast member to a movie */
export function addAdminMovieCast(
   movieId: number,
   data: AddCastData,
   token: string,
): Promise<{ message: string; id: string }> {
   return fetchAPI<{ message: string; id: string }>(`/admin/movies/${movieId}/cast`, {
      method: 'POST',
      body: data,
      token,
   });
}

/** Remove a cast member from a movie */
export function removeAdminMovieCast(castId: string, token: string): Promise<{ message: string }> {
   return fetchAPI<{ message: string }>(`/admin/movie-cast/${castId}`, {
      method: 'DELETE',
      token,
   });
}

/** Add a cast member to a TV show */
export function addAdminTVShowCast(
   tvShowId: number,
   data: AddCastData,
   token: string,
): Promise<{ message: string; id: string }> {
   return fetchAPI<{ message: string; id: string }>(`/admin/tv-shows/${tvShowId}/cast`, {
      method: 'POST',
      body: data,
      token,
   });
}

/** Remove a cast member from a TV show */
export function removeAdminTVShowCast(castId: string, token: string): Promise<{ message: string }> {
   return fetchAPI<{ message: string }>(`/admin/tv-cast/${castId}`, {
      method: 'DELETE',
      token,
   });
}

// ─── Video Sources ──────────────────────────────────────────

/** Admin video source item */
export interface AdminVideoSource {
   readonly id: string;
   readonly mediaType: 'movie' | 'tv';
   readonly mediaId: number;
   readonly season: number;
   readonly episode: number;
   readonly sourceType: 'hls' | 'embed' | 'direct';
   readonly sourceUrl: string;
   readonly label: string;
   readonly quality: string;
   readonly language: string;
   readonly priority: number;
   readonly isActive: boolean;
   readonly createdAt: string;
   readonly updatedAt: string;
}

/** Data required to create a video source */
export interface CreateVideoSourceData {
   readonly mediaType: 'movie' | 'tv';
   readonly mediaId: number;
   readonly season?: number;
   readonly episode?: number;
   readonly sourceType: 'hls' | 'embed' | 'direct';
   readonly sourceUrl: string;
   readonly label?: string;
   readonly quality?: string;
   readonly language?: string;
   readonly priority?: number;
}

/** Data for updating a video source */
export interface UpdateVideoSourceData {
   readonly sourceType?: 'hls' | 'embed' | 'direct';
   readonly sourceUrl?: string;
   readonly label?: string;
   readonly quality?: string;
   readonly language?: string;
   readonly priority?: number;
   readonly isActive?: boolean;
}

/** List video sources for a media item */
export function getAdminVideoSources(
   mediaType: 'movie' | 'tv',
   mediaId: number,
   token: string,
   season?: number,
   episode?: number,
): Promise<{ sources: readonly AdminVideoSource[]; total: number }> {
   const params: Record<string, string | number> = { mediaType, mediaId };
   if (season !== undefined) params['season'] = season;
   if (episode !== undefined) params['episode'] = episode;

   return fetchAPI<{ sources: readonly AdminVideoSource[]; total: number }>(
      '/admin/video-sources',
      {
         params,
         token,
      },
   );
}

/** Create a video source */
export function createAdminVideoSource(
   data: CreateVideoSourceData,
   token: string,
): Promise<{ message: string; id: string }> {
   return fetchAPI<{ message: string; id: string }>('/admin/video-sources', {
      method: 'POST',
      body: data,
      token,
   });
}

/** Update a video source */
export function updateAdminVideoSource(
   sourceId: string,
   data: UpdateVideoSourceData,
   token: string,
): Promise<{ message: string }> {
   return fetchAPI<{ message: string }>(`/admin/video-sources/${sourceId}`, {
      method: 'PATCH',
      body: data,
      token,
   });
}

/** Delete a video source */
export function deleteAdminVideoSource(
   sourceId: string,
   token: string,
): Promise<{ message: string }> {
   return fetchAPI<{ message: string }>(`/admin/video-sources/${sourceId}`, {
      method: 'DELETE',
      token,
   });
}

// ─── CSV Import / Export ────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export interface CsvImportResult {
   readonly created: number;
   readonly updated: number;
   readonly skipped: number;
   readonly failed: number;
   readonly errors: readonly string[];
}

/** Download movies as a CSV file */
export async function exportMoviesCsv(token: string): Promise<void> {
   const res = await fetch(`${API_BASE}/admin/movies/export`, {
      headers: { Authorization: `Bearer ${token}` },
   });
   if (!res.ok) throw new Error('Failed to export movies');
   const blob = await res.blob();
   downloadBlob(blob, 'movies.csv');
}

/** Upload a CSV file to import movies */
export async function importMoviesCsv(
   file: File,
   mode: 'skip' | 'upsert',
   token: string,
): Promise<CsvImportResult> {
   const form = new FormData();
   form.append('file', file);

   const res = await fetch(`${API_BASE}/admin/movies/import?mode=${mode}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
   });

   if (!res.ok) {
      const err = await res.json().catch(() => ({ message: `Import failed: ${res.status}` }));
      throw new Error((err as { message: string }).message);
   }

   return res.json() as Promise<CsvImportResult>;
}

/** Download TV shows as a CSV file */
export async function exportTVShowsCsv(token: string): Promise<void> {
   const res = await fetch(`${API_BASE}/admin/tv-shows/export`, {
      headers: { Authorization: `Bearer ${token}` },
   });
   if (!res.ok) throw new Error('Failed to export TV shows');
   const blob = await res.blob();
   downloadBlob(blob, 'tv-shows.csv');
}

/** Upload a CSV file to import TV shows */
export async function importTVShowsCsv(
   file: File,
   mode: 'skip' | 'upsert',
   token: string,
): Promise<CsvImportResult> {
   const form = new FormData();
   form.append('file', file);

   const res = await fetch(`${API_BASE}/admin/tv-shows/import?mode=${mode}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
   });

   if (!res.ok) {
      const err = await res.json().catch(() => ({ message: `Import failed: ${res.status}` }));
      throw new Error((err as { message: string }).message);
   }

   return res.json() as Promise<CsvImportResult>;
}

function downloadBlob(blob: Blob, filename: string): void {
   const url = URL.createObjectURL(blob);
   const a = document.createElement('a');
   a.href = url;
   a.download = filename;
   document.body.appendChild(a);
   a.click();
   a.remove();
   URL.revokeObjectURL(url);
}
