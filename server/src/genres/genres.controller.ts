import { Controller, Get } from '@nestjs/common';
import { GenresService } from './genres.service';

@Controller('genres')
export class GenresController {
   constructor(private readonly genresService: GenresService) {}

   /** GET /genres/movies */
   @Get('movies')
   getMovieGenres() {
      return this.genresService.fetchMovieGenres();
   }

   /** GET /genres/tv */
   @Get('tv')
   getTVGenres() {
      return this.genresService.fetchTVGenres();
   }
}
