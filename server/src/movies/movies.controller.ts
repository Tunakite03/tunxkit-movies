import { Controller, Get, Param, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { MoviesService } from './movies.service';
import type { DiscoverFilters } from '@/types';

@Controller('movies')
export class MoviesController {
   constructor(private readonly moviesService: MoviesService) {}

   /** GET /movies/trending?page=1 */
   @Get('trending')
   getTrending(@Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number) {
      return this.moviesService.fetchTrending(page);
   }

   /** GET /movies/popular?page=1 */
   @Get('popular')
   getPopular(@Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number) {
      return this.moviesService.fetchByCategory('popular', page);
   }

   /** GET /movies/now-playing?page=1 */
   @Get('now-playing')
   getNowPlaying(@Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number) {
      return this.moviesService.fetchByCategory('now_playing', page);
   }

   /** GET /movies/top-rated?page=1 */
   @Get('top-rated')
   getTopRated(@Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number) {
      return this.moviesService.fetchByCategory('top_rated', page);
   }

   /** GET /movies/upcoming?page=1 */
   @Get('upcoming')
   getUpcoming(@Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number) {
      return this.moviesService.fetchByCategory('upcoming', page);
   }

   /** GET /movies/discover?page=1&year=2024&genreId=28&sortBy=popularity.desc&minRating=7&maxRating=10 */
   @Get('discover')
   discover(
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
      @Query('year') year?: string,
      @Query('genreId') genreId?: string,
      @Query('sortBy') sortBy?: string,
      @Query('minRating') minRating?: string,
      @Query('maxRating') maxRating?: string,
   ) {
      return this.moviesService.discover(
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

   /** GET /movies/genre/:genreId?page=1 */
   @Get('genre/:genreId')
   getByGenre(
      @Param('genreId', ParseIntPipe) genreId: number,
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
   ) {
      return this.moviesService.fetchByGenre(genreId, page);
   }

   /** GET /movies/:id */
   @Get(':id')
   getDetail(@Param('id', ParseIntPipe) id: number) {
      return this.moviesService.fetchDetail(id);
   }

   /** GET /movies/:id/credits */
   @Get(':id/credits')
   getCredits(@Param('id', ParseIntPipe) id: number) {
      return this.moviesService.fetchCredits(id);
   }

   /** GET /movies/:id/videos */
   @Get(':id/videos')
   getVideos(@Param('id', ParseIntPipe) id: number) {
      return this.moviesService.fetchVideos(id);
   }

   /** GET /movies/:id/similar?page=1 */
   @Get(':id/similar')
   getSimilar(
      @Param('id', ParseIntPipe) id: number,
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
   ) {
      return this.moviesService.fetchSimilar(id, page);
   }

   /** GET /movies/:id/providers */
   @Get(':id/providers')
   getWatchProviders(@Param('id', ParseIntPipe) id: number) {
      return this.moviesService.fetchWatchProviders(id);
   }
}
