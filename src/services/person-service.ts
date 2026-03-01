import type { PersonDetail, PersonCredits } from '@/types';
import { fetchTMDB } from './tmdb-client';

/** Fetch person detail by ID */
export function fetchPersonDetail(personId: number): Promise<PersonDetail> {
   return fetchTMDB<PersonDetail>(`/person/${personId}`);
}

/** Fetch combined movie+TV credits for a person */
export function fetchPersonCredits(personId: number): Promise<PersonCredits> {
   return fetchTMDB<PersonCredits>(`/person/${personId}/combined_credits`);
}
