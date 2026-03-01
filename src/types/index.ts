// ─── TMDB Response ───────────────────────────────────────────

/** TMDB paginated response wrapper */
export interface TMDBResponse<T> {
   readonly page: number;
   readonly results: readonly T[];
   readonly total_pages: number;
   readonly total_results: number;
}

// ─── Movie ───────────────────────────────────────────────────

/** Movie summary (from list endpoints) */
export interface Movie {
   readonly id: number;
   readonly title: string;
   readonly original_title: string;
   readonly overview: string;
   readonly poster_path: string | null;
   readonly backdrop_path: string | null;
   readonly release_date: string;
   readonly vote_average: number;
   readonly vote_count: number;
   readonly genre_ids: readonly number[];
   readonly popularity: number;
   readonly adult: boolean;
   readonly original_language: string;
   readonly media_type?: string;
}

/** Movie detail (from /movie/:id endpoint) */
export interface MovieDetail {
   readonly id: number;
   readonly title: string;
   readonly original_title: string;
   readonly tagline: string;
   readonly overview: string;
   readonly poster_path: string | null;
   readonly backdrop_path: string | null;
   readonly release_date: string;
   readonly vote_average: number;
   readonly vote_count: number;
   readonly genres: readonly Genre[];
   readonly runtime: number;
   readonly status: string;
   readonly budget: number;
   readonly revenue: number;
   readonly homepage: string | null;
   readonly imdb_id: string | null;
   readonly popularity: number;
   readonly adult: boolean;
   readonly original_language: string;
   readonly production_companies: readonly ProductionCompany[];
   readonly spoken_languages: readonly SpokenLanguage[];
}

/** Movie category for browsing */
export type MovieCategory = 'popular' | 'top_rated' | 'now_playing' | 'upcoming';

/** Movie category metadata */
export interface CategoryInfo {
   readonly value: MovieCategory;
   readonly label: string;
}

/** Search params for movie list */
export interface MovieSearchParams {
   readonly query?: string;
   readonly page?: number;
   readonly genre?: number;
   readonly year?: number;
}

// ─── TV Show ─────────────────────────────────────────────────

/** TV Show summary (from list endpoints) */
export interface TVShow {
   readonly id: number;
   readonly name: string;
   readonly original_name: string;
   readonly overview: string;
   readonly poster_path: string | null;
   readonly backdrop_path: string | null;
   readonly first_air_date: string;
   readonly vote_average: number;
   readonly vote_count: number;
   readonly genre_ids: readonly number[];
   readonly popularity: number;
   readonly adult: boolean;
   readonly original_language: string;
   readonly media_type?: string;
   readonly origin_country: readonly string[];
}

/** TV Show detail (from /tv/:id endpoint) */
export interface TVShowDetail {
   readonly id: number;
   readonly name: string;
   readonly original_name: string;
   readonly tagline: string;
   readonly overview: string;
   readonly poster_path: string | null;
   readonly backdrop_path: string | null;
   readonly first_air_date: string;
   readonly last_air_date: string;
   readonly vote_average: number;
   readonly vote_count: number;
   readonly genres: readonly Genre[];
   readonly episode_run_time: readonly number[];
   readonly number_of_seasons: number;
   readonly number_of_episodes: number;
   readonly status: string;
   readonly homepage: string | null;
   readonly popularity: number;
   readonly adult: boolean;
   readonly original_language: string;
   readonly production_companies: readonly ProductionCompany[];
   readonly spoken_languages: readonly SpokenLanguage[];
   readonly networks: readonly Network[];
   readonly seasons: readonly Season[];
}

/** TV Show category for browsing */
export type TVCategory = 'popular' | 'top_rated' | 'airing_today' | 'on_the_air';

/** TV category metadata */
export interface TVCategoryInfo {
   readonly value: TVCategory;
   readonly label: string;
}

/** TV Network */
export interface Network {
   readonly id: number;
   readonly name: string;
   readonly logo_path: string | null;
   readonly origin_country: string;
}

/** TV Season */
export interface Season {
   readonly id: number;
   readonly name: string;
   readonly overview: string;
   readonly poster_path: string | null;
   readonly season_number: number;
   readonly episode_count: number;
   readonly air_date: string | null;
   readonly vote_average: number;
}

// ─── Common ──────────────────────────────────────────────────

/** Genre */
export interface Genre {
   readonly id: number;
   readonly name: string;
}

/** Production company */
export interface ProductionCompany {
   readonly id: number;
   readonly name: string;
   readonly logo_path: string | null;
   readonly origin_country: string;
}

/** Spoken language */
export interface SpokenLanguage {
   readonly english_name: string;
   readonly iso_639_1: string;
   readonly name: string;
}

/** Cast member */
export interface CastMember {
   readonly id: number;
   readonly name: string;
   readonly character: string;
   readonly profile_path: string | null;
   readonly order: number;
   readonly known_for_department: string;
}

/** Crew member */
export interface CrewMember {
   readonly id: number;
   readonly name: string;
   readonly job: string;
   readonly department: string;
   readonly profile_path: string | null;
}

/** Credits response */
export interface Credits {
   readonly id: number;
   readonly cast: readonly CastMember[];
   readonly crew: readonly CrewMember[];
}

/** Video (trailers, teasers, etc.) */
export interface Video {
   readonly id: string;
   readonly key: string;
   readonly name: string;
   readonly site: string;
   readonly size: number;
   readonly type: string;
   readonly official: boolean;
   readonly published_at: string;
}

/** Videos response */
export interface VideosResponse {
   readonly id: number;
   readonly results: readonly Video[];
}

/** Unified media item for shared components */
export interface MediaItem {
   readonly id: number;
   readonly title: string;
   readonly posterPath: string | null;
   readonly backdropPath: string | null;
   readonly releaseDate: string;
   readonly voteAverage: number;
   readonly overview: string;
   readonly mediaType: 'movie' | 'tv';
}

// ─── Person ──────────────────────────────────────────────────

/** Person detail (from /person/:id endpoint) */
export interface PersonDetail {
   readonly id: number;
   readonly name: string;
   readonly biography: string;
   readonly birthday: string | null;
   readonly deathday: string | null;
   readonly place_of_birth: string | null;
   readonly profile_path: string | null;
   readonly known_for_department: string;
   readonly also_known_as: readonly string[];
   readonly gender: number;
   readonly popularity: number;
   readonly homepage: string | null;
   readonly imdb_id: string | null;
}

/** Movie credit for a person */
export interface PersonMovieCredit {
   readonly id: number;
   readonly title: string;
   readonly character: string;
   readonly poster_path: string | null;
   readonly backdrop_path: string | null;
   readonly release_date: string;
   readonly vote_average: number;
   readonly overview: string;
   readonly media_type?: string;
}

/** TV credit for a person */
export interface PersonTVCredit {
   readonly id: number;
   readonly name: string;
   readonly character: string;
   readonly poster_path: string | null;
   readonly backdrop_path: string | null;
   readonly first_air_date: string;
   readonly vote_average: number;
   readonly overview: string;
   readonly episode_count: number;
   readonly media_type?: string;
}

/** Combined credits response for a person */
export interface PersonCredits {
   readonly id: number;
   readonly cast: readonly (PersonMovieCredit | PersonTVCredit)[];
}

// ─── Filters ─────────────────────────────────────────────────

/** Sort options for discover endpoints */
export type SortBy =
   | 'popularity.desc'
   | 'popularity.asc'
   | 'vote_average.desc'
   | 'vote_average.asc'
   | 'primary_release_date.desc'
   | 'primary_release_date.asc'
   | 'revenue.desc';

/** Sort option metadata */
export interface SortOption {
   readonly value: SortBy;
   readonly label: string;
}

/** Advanced discover filters */
export interface DiscoverFilters {
   readonly year?: number;
   readonly genreId?: number;
   readonly sortBy?: SortBy;
   readonly minRating?: number;
   readonly maxRating?: number;
}

// ─── Watch Providers ─────────────────────────────────────────

/** A single watch provider (streaming service) */
export interface WatchProvider {
   readonly provider_id: number;
   readonly provider_name: string;
   readonly logo_path: string;
   readonly display_priority: number;
}

/** Watch provider data for a specific region */
export interface WatchProviderRegion {
   readonly link: string;
   readonly flatrate?: readonly WatchProvider[];
   readonly rent?: readonly WatchProvider[];
   readonly buy?: readonly WatchProvider[];
   readonly ads?: readonly WatchProvider[];
}

/** TMDB watch provider response */
export interface WatchProviderResponse {
   readonly id: number;
   readonly results: Readonly<Record<string, WatchProviderRegion>>;
}
