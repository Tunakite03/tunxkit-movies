import type { CategoryInfo, TVCategoryInfo, MovieCategory, TVCategory, SortOption } from '@/types';

/** Movie categories with labels */
export const MOVIE_CATEGORIES: readonly CategoryInfo[] = [
   { value: 'popular', label: 'Phổ biến' },
   { value: 'top_rated', label: 'Đánh giá cao' },
   { value: 'now_playing', label: 'Đang chiếu' },
   { value: 'upcoming', label: 'Sắp chiếu' },
] as const;

/** Default movie category */
export const DEFAULT_CATEGORY: MovieCategory = 'popular';

/** TV categories with labels */
export const TV_CATEGORIES: readonly TVCategoryInfo[] = [
   { value: 'popular', label: 'Phổ biến' },
   { value: 'top_rated', label: 'Đánh giá cao' },
   { value: 'airing_today', label: 'Chiếu hôm nay' },
   { value: 'on_the_air', label: 'Đang phát sóng' },
] as const;

/** Default TV category */
export const DEFAULT_TV_CATEGORY: TVCategory = 'popular';

/** Sort options for discover filters */
export const SORT_OPTIONS: readonly SortOption[] = [
   { value: 'popularity.desc', label: 'Phổ biến nhất' },
   { value: 'popularity.asc', label: 'Ít phổ biến' },
   { value: 'vote_average.desc', label: 'Đánh giá cao nhất' },
   { value: 'vote_average.asc', label: 'Đánh giá thấp nhất' },
   { value: 'primary_release_date.desc', label: 'Mới nhất' },
   { value: 'primary_release_date.asc', label: 'Cũ nhất' },
   { value: 'revenue.desc', label: 'Doanh thu cao nhất' },
] as const;

/** Rating filter options */
export const RATING_OPTIONS = [
   { value: 0, label: 'Tất cả' },
   { value: 7, label: '7+ ⭐' },
   { value: 8, label: '8+ ⭐' },
   { value: 9, label: '9+ ⭐' },
] as const;

/** Items per page */
export const ITEMS_PER_PAGE = 20;
