import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { configuration } from '@/config';
import { PrismaModule } from '@/prisma';
import { TmdbModule } from '@/tmdb';
import { AuthModule } from '@/auth';
import { MoviesModule } from '@/movies';
import { TvModule } from '@/tv';
import { SearchModule } from '@/search';
import { PeopleModule } from '@/people';
import { GenresModule } from '@/genres';
import { WatchlistModule } from '@/watchlist';

@Module({
   imports: [
      ConfigModule.forRoot({
         isGlobal: true,
         load: [configuration],
         envFilePath: '.env',
      }),
      PrismaModule,
      TmdbModule,
      AuthModule,
      MoviesModule,
      TvModule,
      SearchModule,
      PeopleModule,
      GenresModule,
      WatchlistModule,
   ],
})
export class AppModule {}
