import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { configuration } from '@/config';
import { PrismaModule } from '@/prisma';
import { TmdbModule } from '@/modules/tmdb';
import { AuthModule } from '@/modules/auth';
import { MoviesModule } from '@/modules/movies';
import { TvModule } from '@/modules/tv';
import { SearchModule } from '@/modules/search';
import { PeopleModule } from '@/modules/people';
import { GenresModule } from '@/modules/genres';
import { WatchlistModule } from '@/modules/watchlist';

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
