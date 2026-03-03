import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { VideoPlayer } from '@/components/video-player';
import { WatchProviderList } from '@/components/watch-provider-list';
import { MovieCarousel } from '@/components/movie-carousel';
import { fetchMovieDetail, fetchMovieVideos, fetchMovieWatchProviders, fetchSimilarMovies } from '@/services';
import { getPosterUrl, formatRating, formatDate } from '@/lib/image-utils';
import { JsonLd, buildMovieSchema, buildBreadcrumbSchema } from '@/lib/seo';
import { SITE_URL } from '@/constants';

interface WatchPageProps {
   readonly params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: WatchPageProps): Promise<Metadata> {
   const { id } = await params;
   const movieId = Number(id);
   if (Number.isNaN(movieId)) return { title: 'Phim không tìm thấy' };

   try {
      const movie = await fetchMovieDetail(movieId);
      const description = `Xem phim ${movie.title} — Trailer, video và nơi phát sóng.`;
      const posterImage = getPosterUrl(movie.poster_path, 'large');

      return {
         title: `Xem ${movie.title}`,
         description,
         alternates: { canonical: `${SITE_URL}/movies/${movie.id}/watch` },
         openGraph: {
            title: `Xem ${movie.title}`,
            description,
            url: `${SITE_URL}/movies/${movie.id}/watch`,
            images: movie.poster_path ? [{ url: posterImage, width: 500, height: 750, alt: movie.title }] : [],
         },
      };
   } catch {
      return { title: 'Phim không tìm thấy' };
   }
}

export default async function MovieWatchPage({ params }: WatchPageProps) {
   const { id } = await params;
   const movieId = Number(id);
   if (Number.isNaN(movieId)) notFound();

   let movie, videosResponse, watchProviders, similar;
   try {
      [movie, videosResponse, watchProviders, similar] = await Promise.all([
         fetchMovieDetail(movieId),
         fetchMovieVideos(movieId),
         fetchMovieWatchProviders(movieId),
         fetchSimilarMovies(movieId),
      ]);
   } catch {
      notFound();
   }

   const posterUrl = getPosterUrl(movie.poster_path, 'large');
   // Try VN first, fallback to US
   const regionProviders = watchProviders.results.VN ?? watchProviders.results.US;

   return (
      <div className='container mx-auto space-y-8 px-4 py-8 md:px-6'>
         <JsonLd data={buildMovieSchema(movie)} />
         <JsonLd
            data={buildBreadcrumbSchema([
               { name: 'Trang chủ', url: SITE_URL },
               { name: 'Phim', url: `${SITE_URL}/movies` },
               { name: movie.title, url: `${SITE_URL}/movies/${movie.id}` },
               { name: 'Xem phim', url: `${SITE_URL}/movies/${movie.id}/watch` },
            ])}
         />

         {/* Back button + Title */}
         <div className='flex items-start gap-4'>
            <Button
               variant='ghost'
               size='icon'
               asChild
               className='mt-1 shrink-0'
            >
               <Link href={`/movies/${movie.id}`}>
                  <ArrowLeft className='size-5' />
                  <span className='sr-only'>Quay lại</span>
               </Link>
            </Button>
            <div className='min-w-0 flex-1'>
               <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>Xem phim: {movie.title}</h1>
               <p className='mt-1 text-sm text-muted-foreground'>
                  {formatDate(movie.release_date)} • {formatRating(movie.vote_average)}/10
               </p>
            </div>
         </div>

         {/* Main Content */}
         <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
            {/* Video Player — 2/3 width */}
            <div className='space-y-6 lg:col-span-2'>
               <VideoPlayer videos={[...videosResponse.results]} />
            </div>

            {/* Sidebar — 1/3 */}
            <aside className='space-y-6'>
               {/* Movie Card */}
               <div className='overflow-hidden rounded-lg border border-border bg-card'>
                  <div className='relative aspect-2/3 w-full'>
                     <Image
                        src={posterUrl}
                        alt={movie.title}
                        fill
                        sizes='(max-width: 1024px) 100vw, 33vw'
                        className='object-cover'
                     />
                  </div>
                  <div className='space-y-3 p-4'>
                     <h2 className='text-lg font-bold'>{movie.title}</h2>
                     <div className='flex items-center gap-2'>
                        <Star className='size-4 fill-primary text-primary' />
                        <span className='font-medium'>{formatRating(movie.vote_average)}</span>
                        <span className='text-sm text-muted-foreground'>
                           ({movie.vote_count.toLocaleString()} đánh giá)
                        </span>
                     </div>
                     {movie.genres.length > 0 && (
                        <div className='flex flex-wrap gap-1.5'>
                           {movie.genres.map((genre) => (
                              <Badge
                                 key={genre.id}
                                 variant='secondary'
                                 className='text-xs'
                              >
                                 {genre.name}
                              </Badge>
                           ))}
                        </div>
                     )}
                     {movie.overview && (
                        <p className='line-clamp-4 text-sm leading-relaxed text-muted-foreground'>{movie.overview}</p>
                     )}
                     <Button
                        variant='outline'
                        size='sm'
                        asChild
                        className='w-full'
                     >
                        <Link href={`/movies/${movie.id}`}>Xem chi tiết</Link>
                     </Button>
                  </div>
               </div>
            </aside>
         </div>

         <Separator />

         {/* Watch Providers */}
         <section className='space-y-4'>
            <h2 className='text-xl font-bold tracking-tight md:text-2xl'>Nơi xem phim</h2>
            <WatchProviderList providers={regionProviders} />
         </section>

         <Separator />

         {/* Similar Movies */}
         {similar.results.length > 0 && (
            <MovieCarousel
               title='🎬 Phim tương tự'
               movies={similar.results.slice(0, 15)}
            />
         )}
      </div>
   );
}
