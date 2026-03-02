import { Module } from '@nestjs/common';
import { WatchlistService } from './watchlist.service';
import { WatchlistController } from './watchlist.controller';
import { AuthModule } from '@/modules/auth';

@Module({
   imports: [AuthModule],
   controllers: [WatchlistController],
   providers: [WatchlistService],
   exports: [WatchlistService],
})
export class WatchlistModule {}
