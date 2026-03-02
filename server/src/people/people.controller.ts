import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { PeopleService } from './people.service';

@Controller('people')
export class PeopleController {
   constructor(private readonly peopleService: PeopleService) {}

   /** GET /people/:id */
   @Get(':id')
   getDetail(@Param('id', ParseIntPipe) id: number) {
      return this.peopleService.fetchDetail(id);
   }

   /** GET /people/:id/credits */
   @Get(':id/credits')
   getCredits(@Param('id', ParseIntPipe) id: number) {
      return this.peopleService.fetchCredits(id);
   }
}
