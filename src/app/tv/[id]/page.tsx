import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, Clock, Star, Tv, Layers, Play } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CastCard } from '@/components/cast-card';
import { GenreBadgeList } from '@/components/genre-badge';
import { StarRating } from '@/components/star-rating';
import { MediaCarousel } from '@/components/media-carousel';
import { fetchTVDetail, fetchTVCredits, fetchTVVideos, fetchSimilarTV } from '@/services';
import {
   getBackdropUrl,
   getPosterUrl,
   formatRuntime,
   formatDate,
   formatRating,
   tvShowToMediaItem,
} from '@/lib/image-utils';
import { JsonLd, buildTVShowSchema, buildBreadcrumbSchema } from '@/lib/seo';
import { SITE_URL } from '@/constants';
import type { Video } from '@/types';

interface TVDetailPageProps {
   readonly params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: TVDetailPageProps): Promise<Metadata> {
   const { id } = await params;
   const tvId = Number(id);
   if (Number.isNaN(tvId)) return { title: 'Phim bộ không tìm thấy' };

   try {
      const show = await fetchTVDetail(tvId);
      const posterImage = getPosterUrl(show.poster_path, 'large');
      const description = show.overview || `Xem thông tin phim bộ ${show.name}`;

      return {
         title: show.name,
         description,
         alternates: { canonical: `${SITE_URL}/tv/${show.id}` },
         openGraph: {
            title: show.name,
            description,
            url: `${SITE_URL}/tv/${show.id}`,
            type: 'video.tv_show',
            images: show.poster_path ? [{ url: posterImage, width: 500, height: 750, alt: show.name }] : [],
         },
         twitter: {
            card: 'summary_large_image',
            title: show.name,
            description,
            images: show.poster_path ? [posterImage] : [],
         },
      };
   } catch {
      return { title: 'Phim bộ không tìm thấy' };
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

export default async function TVDetailPage({ params }: TVDetailPageProps) {
   const { id } = await params;
   const tvId = Number(id);
   if (Number.isNaN(tvId)) notFound();

   let show, credits, videosResponse, similar;
   try {
      [show, credits, videosResponse, similar] = await Promise.all([
         fetchTVDetail(tvId),
         fetchTVCredits(tvId),
         fetchTVVideos(tvId),
         fetchSimilarTV(tvId),
      ]);
   } catch {
      notFound();
   }

   const trailer = findTrailer(videosResponse.results);
   const topCast = credits.cast.slice(0, 10);
   const backdropUrl = getBackdropUrl(show.backdrop_path, 'original');
   const posterUrl = getPosterUrl(show.poster_path, 'large');
   const avgRuntime = show.episode_run_time.length > 0 ? show.episode_run_time[0] : 0;
   const similarItems = similar.results.slice(0, 15).map(tvShowToMediaItem);

   return (
      <div className='pb-8'>
         <JsonLd data={buildTVShowSchema(show)} />
         <JsonLd
            data={buildBreadcrumbSchema([
               { name: 'Trang chủ', url: SITE_URL },
               { name: 'Phim bộ', url: `${SITE_URL}/tv` },
               { name: show.name, url: `${SITE_URL}/tv/${show.id}` },
            ])}
         />

         {/* Backdrop Hero */}
         <section className='relative h-[50vh] min-h-[350px] w-full overflow-hidden md:h-[60vh]'>
            <Image
               src={backdropUrl}
               alt={show.name}
               fill
               priority
               sizes='100vw'
               className='object-cover'
            />
            <div className='absolute inset-0 bg-linear-to-t from-background via-background/70 to-transparent' />
            <div className='absolute inset-0 bg-linear-to-r from-background/90 to-transparent' />
         </section>

         {/* Show Info */}
         <div className='container relative mx-auto -mt-40 px-4 md:-mt-52 md:px-6'>
            <div className='flex flex-col gap-6 md:flex-row md:gap-8'>
               {/* Poster */}
               <div className='mx-auto w-[200px] shrink-0 md:mx-0 md:w-[300px]'>
                  <div className='relative aspect-2/3 overflow-hidden rounded-lg shadow-xl'>
                     <Image
                        src={posterUrl}
                        alt={show.name}
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
                     <h1 className='text-2xl font-bold tracking-tight md:text-4xl'>{show.name}</h1>
                     {show.tagline && (
                        <p className='mt-1 text-sm italic text-muted-foreground md:text-base'>
                           &ldquo;{show.tagline}&rdquo;
                        </p>
                     )}
                  </div>

                  {/* Rating */}
                  <div className='flex items-center gap-3'>
                     <div className='flex items-center gap-1.5'>
                        <Star className='size-5 fill-primary text-primary' />
                        <span className='text-lg font-bold'>{formatRating(show.vote_average)}</span>
                        <span className='text-sm text-muted-foreground'>/ 10</span>
                     </div>
                     <StarRating rating={show.vote_average} />
                     <span className='text-sm text-muted-foreground'>
                        ({show.vote_count.toLocaleString()} đánh giá)
                     </span>
                  </div>

                  {/* Meta Info */}
                  <div className='flex flex-wrap items-center gap-3 text-sm text-muted-foreground'>
                     <div className='flex items-center gap-1'>
                        <Calendar className='size-4' />
                        <span>{formatDate(show.first_air_date)}</span>
                     </div>
                     {avgRuntime > 0 && (
                        <div className='flex items-center gap-1'>
                           <Clock className='size-4' />
                           <span>{formatRuntime(avgRuntime)}/tập</span>
                        </div>
                     )}
                     <div className='flex items-center gap-1'>
                        <Tv className='size-4' />
                        <span>{show.number_of_seasons} mùa</span>
                     </div>
                     <div className='flex items-center gap-1'>
                        <Layers className='size-4' />
                        <span>{show.number_of_episodes} tập</span>
                     </div>
                     <Badge variant='secondary'>{show.status}</Badge>
                  </div>

                  {/* Genres */}
                  <GenreBadgeList genres={show.genres} />

                  {/* Watch Button */}
                  <div className='flex gap-3'>
                     <Button
                        size='lg'
                        asChild
                     >
                        <Link href={`/tv/${show.id}/watch`}>
                           <Play className='mr-2 size-5' />
                           Xem phim
                        </Link>
                     </Button>
                  </div>

                  {/* Overview */}
                  <div>
                     <h2 className='mb-2 text-lg font-semibold'>Nội dung</h2>
                     <p className='leading-relaxed text-muted-foreground'>{show.overview || 'Chưa có mô tả.'}</p>
                  </div>

                  {/* Networks */}
                  {show.networks.length > 0 && (
                     <div className='flex flex-wrap items-center gap-2 text-sm'>
                        <span className='text-muted-foreground'>Kênh phát sóng:</span>
                        {show.networks.map((network) => (
                           <Badge
                              key={network.id}
                              variant='outline'
                           >
                              {network.name}
                           </Badge>
                        ))}
                     </div>
                  )}
               </div>
            </div>
         </div>

         <div className='container mx-auto mt-8 space-y-8 px-4 md:mt-12 md:space-y-12 md:px-6'>
            {/* Seasons */}
            {show.seasons.length > 0 && (
               <section>
                  <h2 className='mb-4 text-xl font-bold tracking-tight md:text-2xl'>📺 Danh sách mùa</h2>
                  <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-4'>
                     {show.seasons
                        .filter((s) => s.season_number > 0)
                        .map((season) => (
                           <div
                              key={season.id}
                              className='overflow-hidden rounded-lg border border-border bg-card'
                           >
                              <div className='relative aspect-2/3 w-full bg-muted'>
                                 <Image
                                    src={getPosterUrl(season.poster_path, 'medium')}
                                    alt={season.name}
                                    fill
                                    sizes='(max-width: 640px) 50vw, 20vw'
                                    className='object-cover'
                                 />
                              </div>
                              <div className='p-3'>
                                 <h3 className='text-sm font-semibold'>{season.name}</h3>
                                 <p className='text-xs text-muted-foreground'>{season.episode_count} tập</p>
                              </div>
                           </div>
                        ))}
                  </div>
               </section>
            )}

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

            {/* Similar TV Shows */}
            {similarItems.length > 0 && (
               <MediaCarousel
                  title='🎬 Phim bộ tương tự'
                  items={similarItems}
               />
            )}
         </div>
      </div>
   );
}
