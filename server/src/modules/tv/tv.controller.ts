import { Controller, Get, Param, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { TvService } from './tv.service';
import type { DiscoverFilters } from '@/types';

@Controller('tv')
export class TvController {
   constructor(private readonly tvService: TvService) {}

   /** GET /tv/trending?page=1 */
   @Get('trending')
   getTrending(@Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number) {
      return this.tvService.fetchTrending(page);
   }

   /** GET /tv/popular?page=1 */
   @Get('popular')
   getPopular(@Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number) {
      return this.tvService.fetchByCategory('popular', page);
   }

   /** GET /tv/airing-today?page=1 */
   @Get('airing-today')
   getAiringToday(@Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number) {
      return this.tvService.fetchByCategory('airing_today', page);
   }

   /** GET /tv/top-rated?page=1 */
   @Get('top-rated')
   getTopRated(@Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number) {
      return this.tvService.fetchByCategory('top_rated', page);
   }

   /** GET /tv/on-the-air?page=1 */
   @Get('on-the-air')
   getOnTheAir(@Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number) {
      return this.tvService.fetchByCategory('on_the_air', page);
   }

   /** GET /tv/discover?page=1&year=2024&genreId=18&sortBy=popularity.desc */
   @Get('discover')
   discover(
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
      @Query('year') year?: string,
      @Query('genreId') genreId?: string,
      @Query('sortBy') sortBy?: string,
      @Query('minRating') minRating?: string,
      @Query('maxRating') maxRating?: string,
   ) {
      return this.tvService.discover(
         {
            year: year ? parseInt(year, 10) : undefined,
            genreId: genreId ? parseInt(genreId, 10) : undefined,
            sortBy: sortBy as DiscoverFilters['sortBy'],
            minRating: minRating ? parseFloat(minRating) : undefined,
            maxRating: maxRating ? parseFloat(maxRating) : undefined,
         },
         page,
      );
   }

   /** GET /tv/genre/:genreId?page=1 */
   @Get('genre/:genreId')
   getByGenre(
      @Param('genreId', ParseIntPipe) genreId: number,
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
   ) {
      return this.tvService.fetchByGenre(genreId, page);
   }

   /** GET /tv/:id */
   @Get(':id')
   getDetail(@Param('id', ParseIntPipe) id: number) {
      return this.tvService.fetchDetail(id);
   }

   /** GET /tv/:id/credits */
   @Get(':id/credits')
   getCredits(@Param('id', ParseIntPipe) id: number) {
      return this.tvService.fetchCredits(id);
   }

   /** GET /tv/:id/videos */
   @Get(':id/videos')
   getVideos(@Param('id', ParseIntPipe) id: number) {
      return this.tvService.fetchVideos(id);
   }

   /** GET /tv/:id/similar?page=1 */
   @Get(':id/similar')
   getSimilar(
      @Param('id', ParseIntPipe) id: number,
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
   ) {
      return this.tvService.fetchSimilar(id, page);
   }

   /** GET /tv/:id/providers */
   @Get(':id/providers')
   getWatchProviders(@Param('id', ParseIntPipe) id: number) {
      return this.tvService.fetchWatchProviders(id);
   }
}
