import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma';
import type { MediaItem } from '@/types';
import { AddToWatchlistDto } from './dto';

@Injectable()
export class WatchlistService {
   constructor(private readonly prisma: PrismaService) {}

   /** Add a media item to the user's watchlist */
   async addItem(userId: string, dto: AddToWatchlistDto): Promise<MediaItem> {
      const item = await this.prisma.watchlistItem.upsert({
         where: {
            userId_mediaId_mediaType: {
               userId,
               mediaId: dto.id,
               mediaType: dto.mediaType,
            },
         },
         update: {},
         create: {
            userId,
            mediaId: dto.id,
            mediaType: dto.mediaType,
            title: dto.title,
            posterPath: dto.posterPath ?? null,
            backdropPath: dto.backdropPath ?? null,
            overview: dto.overview ?? '',
            releaseDate: dto.releaseDate ?? '',
            voteAverage: dto.voteAverage ?? 0,
         },
      });

      return this.mapToMediaItem(item);
   }

   /** Remove a media item from the user's watchlist */
   async removeItem(userId: string, mediaId: number, mediaType: string): Promise<void> {
      await this.prisma.watchlistItem.deleteMany({
         where: { userId, mediaId, mediaType },
      });
   }

   /** Clear the user's entire watchlist */
   async clearAll(userId: string): Promise<void> {
      await this.prisma.watchlistItem.deleteMany({
         where: { userId },
      });
   }

   /** Fetch all watchlist items for a user */
   async getAll(userId: string): Promise<MediaItem[]> {
      const items = await this.prisma.watchlistItem.findMany({
         where: { userId },
         orderBy: { createdAt: 'desc' },
      });

      return items.map((item) => this.mapToMediaItem(item));
   }

   /** Check if a media item is in the user's watchlist */
   async isInWatchlist(userId: string, mediaId: number, mediaType: string): Promise<boolean> {
      const count = await this.prisma.watchlistItem.count({
         where: { userId, mediaId, mediaType },
      });

      return count > 0;
   }

   /** Map a Prisma WatchlistItem to the MediaItem shape */
   private mapToMediaItem(item: {
      mediaId: number;
      title: string;
      posterPath: string | null;
      backdropPath: string | null;
      overview: string;
      releaseDate: string;
      voteAverage: number;
      mediaType: string;
   }): MediaItem {
      return {
         id: item.mediaId,
         title: item.title,
         posterPath: item.posterPath,
         backdropPath: item.backdropPath,
         overview: item.overview,
         releaseDate: item.releaseDate,
         voteAverage: item.voteAverage,
         mediaType: item.mediaType as 'movie' | 'tv',
      };
   }
}
