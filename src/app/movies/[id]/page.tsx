import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, Clock, DollarSign, Star, Play } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CastCard } from '@/components/cast-card';
import { GenreBadgeList } from '@/components/genre-badge';
import { StarRating } from '@/components/star-rating';
import { MovieCarousel } from '@/components/movie-carousel';
import { fetchMovieDetail, fetchMovieCredits, fetchMovieVideos, fetchSimilarMovies } from '@/services';
import {
   getBackdropUrl,
   getPosterUrl,
   formatRuntime,
   formatDate,
   formatRating,
   formatCurrency,
} from '@/lib/image-utils';
import { JsonLd, buildMovieSchema, buildBreadcrumbSchema } from '@/lib/seo';
import { SITE_NAME, SITE_URL } from '@/constants';
import type { Video } from '@/types';

interface MovieDetailPageProps {
   readonly params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: MovieDetailPageProps): Promise<Metadata> {
   const { id } = await params;
   const movieId = Number(id);
   if (Number.isNaN(movieId)) return { title: 'Phim không tìm thấy' };

   try {
      const movie = await fetchMovieDetail(movieId);
      const posterImage = getPosterUrl(movie.poster_path, 'large');
      const description = movie.overview || `Xem thông tin phim ${movie.title}`;

      return {
         title: movie.title,
         description,
         alternates: { canonical: `${SITE_URL}/movies/${movie.id}` },
         openGraph: {
            title: movie.title,
            description,
            url: `${SITE_URL}/movies/${movie.id}`,
            type: 'video.movie',
            images: movie.poster_path ? [{ url: posterImage, width: 500, height: 750, alt: movie.title }] : [],
            releaseDate: movie.release_date || undefined,
         },
         twitter: {
            card: 'summary_large_image',
            title: movie.title,
            description,
            images: movie.poster_path ? [posterImage] : [],
         },
      };
   } catch {
      return { title: 'Phim không tìm thấy' };
   }
}

/** Find the best trailer from video results */
function findTrailer(videos: readonly Video[]): Video | undefined {
   return (
      videos.find((v) => v.site === 'YouTube' && v.type === 'Trailer' && v.official) ??
      videos.find((v) => v.site === 'YouTube' && v.type === 'Trailer') ??
      videos.find((v) => v.site === 'YouTube')
   );
}

export default async function MovieDetailPage({ params }: MovieDetailPageProps) {
   const { id } = await params;
   const movieId = Number(id);
   if (Number.isNaN(movieId)) notFound();

   let movie, credits, videosResponse, similar;
   try {
      [movie, credits, videosResponse, similar] = await Promise.all([
         fetchMovieDetail(movieId),
         fetchMovieCredits(movieId),
         fetchMovieVideos(movieId),
         fetchSimilarMovies(movieId),
      ]);
   } catch {
      notFound();
   }

   const trailer = findTrailer(videosResponse.results);
   const director = credits.crew.find((c) => c.job === 'Director');
   const topCast = credits.cast.slice(0, 10);
   const backdropUrl = getBackdropUrl(movie.backdrop_path, 'original');
   const posterUrl = getPosterUrl(movie.poster_path, 'large');

   return (
      <div className='pb-8'>
         <JsonLd data={buildMovieSchema(movie)} />
         <JsonLd
            data={buildBreadcrumbSchema([
               { name: 'Trang chủ', url: SITE_URL },
               { name: 'Phim', url: `${SITE_URL}/movies` },
               { name: movie.title, url: `${SITE_URL}/movies/${movie.id}` },
            ])}
         />

         {/* Backdrop Hero */}
         <section className='relative h-[50vh] min-h-[350px] w-full overflow-hidden md:h-[60vh]'>
            <Image
               src={backdropUrl}
               alt={movie.title}
               fill
               priority
               sizes='100vw'
               className='object-cover'
            />
            <div className='absolute inset-0 bg-linear-to-t from-background via-background/70 to-transparent' />
            <div className='absolute inset-0 bg-linear-to-r from-background/90 to-transparent' />
         </section>

         {/* Movie Info */}
         <div className='container relative mx-auto -mt-40 px-4 md:-mt-52 md:px-6'>
            <div className='flex flex-col gap-6 md:flex-row md:gap-8'>
               {/* Poster */}
               <div className='mx-auto w-[200px] shrink-0 md:mx-0 md:w-[300px]'>
                  <div className='relative aspect-2/3 overflow-hidden rounded-lg shadow-xl'>
                     <Image
                        src={posterUrl}
                        alt={movie.title}
                        fill
                        sizes='300px'
                        className='object-cover'
                        priority
                     />
                  </div>
               </div>

               {/* Details */}
               <div className='flex-1 space-y-4'>
                  <div>
                     <h1 className='text-2xl font-bold tracking-tight md:text-4xl'>{movie.title}</h1>
                     {movie.tagline && (
                        <p className='mt-1 text-sm italic text-muted-foreground md:text-base'>
                           &ldquo;{movie.tagline}&rdquo;
                        </p>
                     )}
                  </div>

                  {/* Rating */}
                  <div className='flex items-center gap-3'>
                     <div className='flex items-center gap-1.5'>
                        <Star className='size-5 fill-primary text-primary' />
                        <span className='text-lg font-bold'>{formatRating(movie.vote_average)}</span>
                        <span className='text-sm text-muted-foreground'>/ 10</span>
                     </div>
                     <StarRating rating={movie.vote_average} />
                     <span className='text-sm text-muted-foreground'>
                        ({movie.vote_count.toLocaleString()} đánh giá)
                     </span>
                  </div>

                  {/* Meta Info */}
                  <div className='flex flex-wrap items-center gap-3 text-sm text-muted-foreground'>
                     <div className='flex items-center gap-1'>
                        <Calendar className='size-4' />
                        <span>{formatDate(movie.release_date)}</span>
                     </div>
                     {movie.runtime > 0 && (
                        <div className='flex items-center gap-1'>
                           <Clock className='size-4' />
                           <span>{formatRuntime(movie.runtime)}</span>
                        </div>
                     )}
                     {director && <Badge variant='secondary'>Đạo diễn: {director.name}</Badge>}
                  </div>

                  {/* Genres */}
                  <GenreBadgeList genres={movie.genres} />

                  {/* Watch Button */}
                  <div className='flex gap-3'>
                     <Button
                        size='lg'
                        asChild
                     >
                        <Link href={`/movies/${movie.id}/watch`}>
                           <Play className='mr-2 size-5' />
                           Xem phim
                        </Link>
                     </Button>
                  </div>

                  {/* Overview */}
                  <div>
                     <h2 className='mb-2 text-lg font-semibold'>Nội dung</h2>
                     <p className='leading-relaxed text-muted-foreground'>{movie.overview || 'Chưa có mô tả.'}</p>
                  </div>

                  {/* Budget & Revenue */}
                  {(movie.budget > 0 || movie.revenue > 0) && (
                     <div className='flex flex-wrap gap-4 text-sm'>
                        {movie.budget > 0 && (
                           <div className='flex items-center gap-1'>
                              <DollarSign className='size-4 text-muted-foreground' />
                              <span className='text-muted-foreground'>Kinh phí:</span>
                              <span className='font-medium'>{formatCurrency(movie.budget)}</span>
                           </div>
                        )}
                        {movie.revenue > 0 && (
                           <div className='flex items-center gap-1'>
                              <DollarSign className='size-4 text-muted-foreground' />
                              <span className='text-muted-foreground'>Doanh thu:</span>
                              <span className='font-medium'>{formatCurrency(movie.revenue)}</span>
                           </div>
                        )}
                     </div>
                  )}
               </div>
            </div>
         </div>

         <div className='container mx-auto mt-8 space-y-8 px-4 md:mt-12 md:space-y-12 md:px-6'>
            {/* Trailer */}
            {trailer && (
               <section>
                  <h2 className='mb-4 text-xl font-bold tracking-tight md:text-2xl'>🎥 Trailer</h2>
                  <div className='relative aspect-video w-full overflow-hidden rounded-lg'>
                     <iframe
                        src={`https://www.youtube.com/embed/${trailer.key}`}
                        title={trailer.name}
                        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                        allowFullScreen
                        className='absolute inset-0 size-full'
                     />
                  </div>
               </section>
            )}

            <Separator />

            {/* Cast */}
            {topCast.length > 0 && (
               <section>
                  <h2 className='mb-4 text-xl font-bold tracking-tight md:text-2xl'>🎭 Diễn viên</h2>
                  <div className='flex gap-4 overflow-x-auto pb-4 md:gap-6'>
                     {topCast.map((member) => (
                        <div
                           key={member.id}
                           className='shrink-0'
                        >
                           <CastCard member={member} />
                        </div>
                     ))}
                  </div>
               </section>
            )}

            <Separator />

            {/* Similar Movies */}
            {similar.results.length > 0 && (
               <MovieCarousel
                  title='🎬 Phim tương tự'
                  movies={similar.results.slice(0, 15)}
               />
            )}
         </div>
      </div>
   );
}
