/** Site metadata */
export const SITE_NAME = 'TunxKit Movies';
export const SITE_DESCRIPTION = 'Khám phá thế giới điện ảnh - Xem thông tin phim, trailer, đánh giá và nhiều hơn nữa.';

/** Base URL for canonical links and OG tags — set via env or fallback */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tunxkit-movies.vercel.app';

/** Default SEO keywords */
export const SITE_KEYWORDS = [
   'phim',
   'phim lẻ',
   'phim bộ',
   'phim hay',
   'xem phim',
   'phim mới',
   'trailer phim',
   'đánh giá phim',
   'thể loại phim',
   'diễn viên',
   'TunxKit Movies',
] as const;
