import {
   Controller,
   Get,
   Post,
   Delete,
   Body,
   Param,
   Query,
   UseGuards,
   ParseIntPipe,
   HttpCode,
   HttpStatus,
} from '@nestjs/common';

import { WatchlistService } from './watchlist.service';
import { AddToWatchlistDto } from './dto';
import { JwtAuthGuard, CurrentUser } from '@/auth';
import type { AuthenticatedUser } from '@/types';

@Controller('watchlist')
@UseGuards(JwtAuthGuard)
export class WatchlistController {
   constructor(private readonly watchlistService: WatchlistService) {}

   /** GET /watchlist — Get all watchlist items */
   @Get()
   getAll(@CurrentUser() user: AuthenticatedUser) {
      return this.watchlistService.getAll(user.id);
   }

   /** POST /watchlist — Add item to watchlist */
   @Post()
   add(@CurrentUser() user: AuthenticatedUser, @Body() dto: AddToWatchlistDto) {
      return this.watchlistService.addItem(user.id, dto);
   }

   /** GET /watchlist/check?mediaId=123&mediaType=movie — Check if in watchlist */
   @Get('check')
   check(
      @CurrentUser() user: AuthenticatedUser,
      @Query('mediaId', ParseIntPipe) mediaId: number,
      @Query('mediaType') mediaType: string,
   ) {
      return this.watchlistService.isInWatchlist(user.id, mediaId, mediaType);
   }

   /** DELETE /watchlist/clear — Clear entire watchlist */
   @Delete('clear')
   @HttpCode(HttpStatus.NO_CONTENT)
   clearAll(@CurrentUser() user: AuthenticatedUser) {
      return this.watchlistService.clearAll(user.id);
   }

   /** DELETE /watchlist/:mediaId/:mediaType — Remove item */
   @Delete(':mediaId/:mediaType')
   @HttpCode(HttpStatus.NO_CONTENT)
   remove(
      @CurrentUser() user: AuthenticatedUser,
      @Param('mediaId', ParseIntPipe) mediaId: number,
      @Param('mediaType') mediaType: string,
   ) {
      return this.watchlistService.removeItem(user.id, mediaId, mediaType);
   }
}
