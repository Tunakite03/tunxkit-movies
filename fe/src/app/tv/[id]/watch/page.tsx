import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Star, Tv, Layers } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { VideoPlayer } from '@/components/video-player';
import { WatchProviderList } from '@/components/watch-provider-list';
import { MediaCarousel } from '@/components/media-carousel';
import { fetchTVDetail, fetchTVVideos, fetchTVWatchProviders, fetchSimilarTV } from '@/services';
import { getPosterUrl, formatRating, formatDate, tvShowToMediaItem } from '@/lib/image-utils';
import { JsonLd, buildTVShowSchema, buildBreadcrumbSchema } from '@/lib/seo';
import { SITE_URL } from '@/constants';

interface WatchPageProps {
   readonly params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: WatchPageProps): Promise<Metadata> {
   const { id } = await params;
   const tvId = Number(id);
   if (Number.isNaN(tvId)) return { title: 'Phim bộ không tìm thấy' };

   try {
      const show = await fetchTVDetail(tvId);
      const description = `Xem phim bộ ${show.name} — Trailer, video và nơi phát sóng.`;
      const posterImage = getPosterUrl(show.poster_path, 'large');

      return {
         title: `Xem ${show.name}`,
         description,
         alternates: { canonical: `${SITE_URL}/tv/${show.id}/watch` },
         openGraph: {
            title: `Xem ${show.name}`,
            description,
            url: `${SITE_URL}/tv/${show.id}/watch`,
            images: show.poster_path ? [{ url: posterImage, width: 500, height: 750, alt: show.name }] : [],
         },
      };
   } catch {
      return { title: 'Phim bộ không tìm thấy' };
   }
}

export default async function TVWatchPage({ params }: WatchPageProps) {
   const { id } = await params;
   const tvId = Number(id);
   if (Number.isNaN(tvId)) notFound();

   let show, videosResponse, watchProviders, similar;
   try {
      [show, videosResponse, watchProviders, similar] = await Promise.all([
         fetchTVDetail(tvId),
         fetchTVVideos(tvId),
         fetchTVWatchProviders(tvId),
         fetchSimilarTV(tvId),
      ]);
   } catch {
      notFound();
   }

   const posterUrl = getPosterUrl(show.poster_path, 'large');
   const regionProviders = watchProviders.results.VN ?? watchProviders.results.US;
   const similarItems = similar.results.slice(0, 15).map(tvShowToMediaItem);

   return (
      <div className='container mx-auto space-y-8 px-4 py-8 md:px-6'>
         <JsonLd data={buildTVShowSchema(show)} />
         <JsonLd
            data={buildBreadcrumbSchema([
               { name: 'Trang chủ', url: SITE_URL },
               { name: 'Phim bộ', url: `${SITE_URL}/tv` },
               { name: show.name, url: `${SITE_URL}/tv/${show.id}` },
               { name: 'Xem phim', url: `${SITE_URL}/tv/${show.id}/watch` },
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
               <Link href={`/tv/${show.id}`}>
                  <ArrowLeft className='size-5' />
                  <span className='sr-only'>Quay lại</span>
               </Link>
            </Button>
            <div className='min-w-0 flex-1'>
               <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>Xem phim bộ: {show.name}</h1>
               <div className='mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground'>
                  <span>{formatDate(show.first_air_date)}</span>
                  <span>•</span>
                  <span>{formatRating(show.vote_average)}/10</span>
                  <span>•</span>
                  <span className='flex items-center gap-1'>
                     <Tv className='size-3.5' />
                     {show.number_of_seasons} mùa
                  </span>
                  <span>•</span>
                  <span className='flex items-center gap-1'>
                     <Layers className='size-3.5' />
                     {show.number_of_episodes} tập
                  </span>
               </div>
            </div>
         </div>

         {/* Main Content */}
         <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
            {/* Video Player — 2/3 */}
            <div className='space-y-6 lg:col-span-2'>
               <VideoPlayer videos={[...videosResponse.results]} />
            </div>

            {/* Sidebar — 1/3 */}
            <aside className='space-y-6'>
               {/* Show Card */}
               <div className='overflow-hidden rounded-lg border border-border bg-card'>
                  <div className='relative aspect-2/3 w-full'>
                     <Image
                        src={posterUrl}
                        alt={show.name}
                        fill
                        sizes='(max-width: 1024px) 100vw, 33vw'
                        className='object-cover'
                     />
                  </div>
                  <div className='space-y-3 p-4'>
                     <h2 className='text-lg font-bold'>{show.name}</h2>
                     <div className='flex items-center gap-2'>
                        <Star className='size-4 fill-primary text-primary' />
                        <span className='font-medium'>{formatRating(show.vote_average)}</span>
                        <span className='text-sm text-muted-foreground'>
                           ({show.vote_count.toLocaleString()} đánh giá)
                        </span>
                     </div>
                     {show.genres.length > 0 && (
                        <div className='flex flex-wrap gap-1.5'>
                           {show.genres.map((genre) => (
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
                     {show.overview && (
                        <p className='line-clamp-4 text-sm leading-relaxed text-muted-foreground'>{show.overview}</p>
                     )}
                     <Button
                        variant='outline'
                        size='sm'
                        asChild
                        className='w-full'
                     >
                        <Link href={`/tv/${show.id}`}>Xem chi tiết</Link>
                     </Button>
                  </div>
               </div>
            </aside>
         </div>

         <Separator />

         {/* Watch Providers */}
         <section className='space-y-4'>
            <h2 className='text-xl font-bold tracking-tight md:text-2xl'>📺 Nơi xem phim</h2>
            <WatchProviderList providers={regionProviders} />
         </section>

         <Separator />

         {/* Similar TV Shows */}
         {similarItems.length > 0 && (
            <MediaCarousel
               title='🎬 Phim bộ tương tự'
               items={similarItems}
            />
         )}
      </div>
   );
}
