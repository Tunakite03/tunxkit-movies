/** TMDB API base URL */
export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

/** TMDB image base URLs */
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

/** Common image sizes */
export const IMAGE_SIZES = {
   poster: {
      small: `${TMDB_IMAGE_BASE}/w185`,
      medium: `${TMDB_IMAGE_BASE}/w342`,
      large: `${TMDB_IMAGE_BASE}/w500`,
      original: `${TMDB_IMAGE_BASE}/original`,
   },
   backdrop: {
      small: `${TMDB_IMAGE_BASE}/w780`,
      large: `${TMDB_IMAGE_BASE}/w1280`,
      original: `${TMDB_IMAGE_BASE}/original`,
   },
   profile: {
      small: `${TMDB_IMAGE_BASE}/w185`,
      medium: `${TMDB_IMAGE_BASE}/h632`,
      original: `${TMDB_IMAGE_BASE}/original`,
   },
} as const;

/** Revalidation time in seconds (1 hour) */
export const REVALIDATE_TIME = 3600;
