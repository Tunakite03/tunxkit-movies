import { IMAGE_SIZES } from '@/constants';
import type { Movie, TVShow, MediaItem } from '@/types';

/**
 * Build full poster image URL from TMDB path.
 * Returns a placeholder if path is null.
 */
export function getPosterUrl(path: string | null, size: keyof typeof IMAGE_SIZES.poster = 'medium'): string {
   if (!path) {
      return '/placeholder-poster.svg';
   }
   return `${IMAGE_SIZES.poster[size]}${path}`;
}

/**
 * Build full backdrop image URL from TMDB path.
 * Returns a placeholder if path is null.
 */
export function getBackdropUrl(path: string | null, size: keyof typeof IMAGE_SIZES.backdrop = 'large'): string {
   if (!path) {
      return '/placeholder-backdrop.svg';
   }
   return `${IMAGE_SIZES.backdrop[size]}${path}`;
}

/**
 * Build full profile image URL from TMDB path.
 * Returns a placeholder if path is null.
 */
export function getProfileUrl(path: string | null, size: keyof typeof IMAGE_SIZES.profile = 'medium'): string {
   if (!path) {
      return '/placeholder-profile.svg';
   }
   return `${IMAGE_SIZES.profile[size]}${path}`;
}

/**
 * Format runtime minutes to hours and minutes string.
 * @example formatRuntime(148) => "2h 28m"
 */
export function formatRuntime(minutes: number): string {
   if (minutes <= 0) return 'N/A';
   const hours = Math.floor(minutes / 60);
   const mins = minutes % 60;
   if (hours === 0) return `${mins}m`;
   if (mins === 0) return `${hours}h`;
   return `${hours}h ${mins}m`;
}

/**
 * Format a date string to localized Vietnamese date.
 * @example formatDate("2024-03-15") => "15/03/2024"
 */
export function formatDate(dateString: string): string {
   if (!dateString) return 'N/A';
   try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
         day: '2-digit',
         month: '2-digit',
         year: 'numeric',
      });
   } catch {
      return 'N/A';
   }
}

/**
 * Format vote average to a single decimal string.
 * @example formatRating(7.856) => "7.9"
 */
export function formatRating(voteAverage: number): string {
   return voteAverage.toFixed(1);
}

/**
 * Get year from a date string.
 * @example getYear("2024-03-15") => "2024"
 */
export function getYear(dateString: string): string {
   if (!dateString) return 'N/A';
   return dateString.slice(0, 4);
}

/**
 * Format a large number to a compact string.
 * @example formatCurrency(1500000) => "$1,500,000"
 */
export function formatCurrency(amount: number): string {
   if (amount <= 0) return 'N/A';
   return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
   }).format(amount);
}

/**
 * Convert a Movie to a unified MediaItem.
 */
export function movieToMediaItem(movie: Movie): MediaItem {
   return {
      id: movie.id,
      title: movie.title,
      posterPath: movie.poster_path,
      backdropPath: movie.backdrop_path,
      releaseDate: movie.release_date,
      voteAverage: movie.vote_average,
      overview: movie.overview,
      mediaType: 'movie',
   };
}

/**
 * Convert a TVShow to a unified MediaItem.
 */
export function tvShowToMediaItem(tvShow: TVShow): MediaItem {
   return {
      id: tvShow.id,
      title: tvShow.name,
      posterPath: tvShow.poster_path,
      backdropPath: tvShow.backdrop_path,
      releaseDate: tvShow.first_air_date,
      voteAverage: tvShow.vote_average,
      overview: tvShow.overview,
      mediaType: 'tv',
   };
}
