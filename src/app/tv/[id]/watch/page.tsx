import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { TVWatchClient } from './tv-watch-client';
import { fetchTVDetail, fetchTVEmbed, fetchSimilarTV } from '@/services';
import { getPosterUrl, tvShowToMediaItem } from '@/lib/image-utils';
import { JsonLd, buildTVShowSchema, buildBreadcrumbSchema } from '@/lib/seo';
import { SITE_URL } from '@/constants';

// Embed URLs must be generated dynamically
export const dynamic = 'force-dynamic';

interface WatchPageProps {
   readonly params: Promise<{ id: string }>;
   readonly searchParams: Promise<{ season?: string; episode?: string }>;
}

export async function generateMetadata({ params }: WatchPageProps): Promise<Metadata> {
   const { id } = await params;
   const tvId = Number(id);
   if (Number.isNaN(tvId)) return { title: 'Phim bộ không tìm thấy' };

   try {
      const show = await fetchTVDetail(tvId);
      const description = `Xem phim bộ ${show.name} — HD Vietsub + Thuyết minh miễn phí.`;
      const posterImage = getPosterUrl(show.poster_path, 'large');

      return {
         title: `Xem ${show.name}`,
         description,
         alternates: { canonical: `${SITE_URL}/tv/${show.id}/watch` },
         openGraph: {
            title: `Xem ${show.name}`,
            description,
            url: `${SITE_URL}/tv/${show.id}/watch`,
            images: show.poster_path
               ? [{ url: posterImage, width: 500, height: 750, alt: show.name }]
               : [],
         },
      };
   } catch {
      return { title: 'Phim bộ không tìm thấy' };
   }
}

export default async function TVWatchPage({ params, searchParams }: WatchPageProps) {
   const { id } = await params;
   const tvId = Number(id);
   if (Number.isNaN(tvId)) notFound();

   const query = await searchParams;
   const initialSeason = Math.max(1, Number(query.season) || 1);
   const initialEpisode = Math.max(1, Number(query.episode) || 1);

   let show, embedResponse, similar;
   try {
      [show, embedResponse, similar] = await Promise.all([
         fetchTVDetail(tvId),
         fetchTVEmbed(tvId, initialSeason, initialEpisode),
         fetchSimilarTV(tvId),
      ]);
   } catch {
      notFound();
   }

   const similarItems = similar.results.slice(0, 15).map(tvShowToMediaItem);

   return (
      <>
         <JsonLd data={buildTVShowSchema(show)} />
         <JsonLd
            data={buildBreadcrumbSchema([
               { name: 'Trang chủ', url: SITE_URL },
               { name: 'Phim bộ', url: `${SITE_URL}/tv` },
               { name: show.name, url: `${SITE_URL}/tv/${show.id}` },
               { name: 'Xem phim', url: `${SITE_URL}/tv/${show.id}/watch` },
            ])}
         />
         <TVWatchClient
            show={show}
            initialSources={embedResponse.sources}
            similarItems={similarItems}
            initialSeason={initialSeason}
            initialEpisode={initialEpisode}
         />
      </>
   );
}
