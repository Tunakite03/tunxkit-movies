import { Controller, Get, Query, DefaultValuePipe, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
   constructor(private readonly searchService: SearchService) {}

   /** GET /search/movies?query=batman&page=1 */
   @Get('movies')
   searchMovies(@Query('query') query: string, @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number) {
      if (!query?.trim()) {
         throw new BadRequestException('Query parameter is required.');
      }
      return this.searchService.searchMovies(query.trim(), page);
   }

   /** GET /search/tv?query=breaking+bad&page=1 */
   @Get('tv')
   searchTV(@Query('query') query: string, @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number) {
      if (!query?.trim()) {
         throw new BadRequestException('Query parameter is required.');
      }
      return this.searchService.searchTV(query.trim(), page);
   }

   /** GET /search/multi?query=avengers&page=1 */
   @Get('multi')
   searchMulti(@Query('query') query: string, @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number) {
      if (!query?.trim()) {
         throw new BadRequestException('Query parameter is required.');
      }
      return this.searchService.searchMulti(query.trim(), page);
   }
}
