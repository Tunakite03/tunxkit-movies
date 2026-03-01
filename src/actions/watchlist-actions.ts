'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import type { MediaItem } from '@/types';

/** Add a media item to the signed-in user's watchlist */
export async function addToWatchlist(item: MediaItem): Promise<void> {
   const session = await auth();
   if (!session?.user?.id) return;

   await prisma.watchlistItem.upsert({
      where: {
         userId_mediaId_mediaType: {
            userId: session.user.id,
            mediaId: item.id,
            mediaType: item.mediaType,
         },
      },
      update: {},
      create: {
         userId: session.user.id,
         mediaId: item.id,
         mediaType: item.mediaType,
         title: item.title,
         posterPath: item.posterPath,
         backdropPath: item.backdropPath,
         overview: item.overview,
         releaseDate: item.releaseDate,
         voteAverage: item.voteAverage,
      },
   });
}

/** Remove a media item from the signed-in user's watchlist */
export async function removeFromWatchlist(mediaId: number, mediaType: 'movie' | 'tv'): Promise<void> {
   const session = await auth();
   if (!session?.user?.id) return;

   await prisma.watchlistItem.deleteMany({
      where: {
         userId: session.user.id,
         mediaId: mediaId,
         mediaType,
      },
   });
}

/** Clear the signed-in user's entire watchlist */
export async function clearWatchlist(): Promise<void> {
   const session = await auth();
   if (!session?.user?.id) return;

   await prisma.watchlistItem.deleteMany({ where: { userId: session.user.id } });
}

/** Fetch all watchlist items for the signed-in user */
export async function getWatchlist(): Promise<MediaItem[]> {
   const session = await auth();
   if (!session?.user?.id) return [];

   const items = await prisma.watchlistItem.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
   });

   return items.map((item) => ({
      id: item.mediaId,
      title: item.title,
      posterPath: item.posterPath,
      backdropPath: item.backdropPath,
      overview: item.overview,
      releaseDate: item.releaseDate,
      voteAverage: item.voteAverage,
      mediaType: item.mediaType as 'movie' | 'tv',
   }));
}
