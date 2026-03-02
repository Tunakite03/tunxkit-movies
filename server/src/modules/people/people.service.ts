import { Injectable } from '@nestjs/common';
import { TmdbService } from '@/modules/tmdb';
import type { PersonDetail, PersonCredits } from '@/types';

@Injectable()
export class PeopleService {
   constructor(private readonly tmdb: TmdbService) {}

   /** Fetch person detail by ID */
   fetchDetail(personId: number): Promise<PersonDetail> {
      return this.tmdb.fetch<PersonDetail>(`/person/${personId}`);
   }

   /** Fetch combined movie+TV credits for a person */
   fetchCredits(personId: number): Promise<PersonCredits> {
      return this.tmdb.fetch<PersonCredits>(`/person/${personId}/combined_credits`);
   }
}
