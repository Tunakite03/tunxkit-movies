import type { Metadata } from 'next';

import { HeroSection } from '@/components/hero-section';
import { MovieCarousel } from '@/components/movie-carousel';
import { MediaCarousel } from '@/components/media-carousel';
import {
   fetchTrending,
   fetchPopular,
   fetchNowPlaying,
   fetchTopRated,
   fetchUpcoming,
   fetchTrendingTV,
   fetchPopularTV,
} from '@/services';
import { tvShowToMediaItem } from '@/lib/image-utils';
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from '@/constants';

// TMDB data changes frequently and requires a valid API key — skip static prerendering
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
   title: `${SITE_NAME} - Khám phá thế giới điện ảnh`,
   description: SITE_DESCRIPTION,
   alternates: { canonical: SITE_URL },
};

export default async function HomePage() {
   const [trending, popular, nowPlaying, topRated, upcoming, trendingTV, popularTV] = await Promise.all([
      fetchTrending(),
      fetchPopular(),
      fetchNowPlaying(),
      fetchTopRated(),
      fetchUpcoming(),
      fetchTrendingTV(),
      fetchPopularTV(),
   ]);

   const heroMovie = trending.results[0];

   return (
      <div className='space-y-8 pb-8 md:space-y-12'>
         {/* Hero Banner */}
         {heroMovie && <HeroSection movie={heroMovie} />}

         {/* Movie Sections */}
         <div className='container mx-auto space-y-8 px-4 md:space-y-12 md:px-6'>
            <MovieCarousel
               title='🔥 Xu hướng'
               movies={trending.results.slice(0, 15)}
               href='/movies?category=popular'
            />

            <MovieCarousel
               title='🎬 Đang chiếu'
               movies={nowPlaying.results.slice(0, 15)}
               href='/movies?category=now_playing'
            />

            <MovieCarousel
               title='⭐ Đánh giá cao'
               movies={topRated.results.slice(0, 15)}
               href='/movies?category=top_rated'
            />

            <MovieCarousel
               title='🍿 Phổ biến'
               movies={popular.results.slice(0, 15)}
               href='/movies?category=popular'
            />

            <MovieCarousel
               title='📅 Sắp chiếu'
               movies={upcoming.results.slice(0, 15)}
               href='/movies?category=upcoming'
            />

            {/* TV Shows */}
            <MediaCarousel
               title='📺 Phim bộ xu hướng'
               items={trendingTV.results.slice(0, 15).map(tvShowToMediaItem)}
               href='/tv'
            />

            <MediaCarousel
               title='🔥 Phim bộ phổ biến'
               items={popularTV.results.slice(0, 15).map(tvShowToMediaItem)}
               href='/tv?category=popular'
            />
         </div>
      </div>
   );
}
