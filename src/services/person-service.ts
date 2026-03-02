import type { PersonDetail, PersonCredits } from '@/types';
import { fetchAPI } from '@/lib/api-client';

/** Fetch person detail by ID */
export function fetchPersonDetail(personId: number): Promise<PersonDetail> {
   return fetchAPI<PersonDetail>(`/people/${personId}`);
}

/** Fetch combined movie+TV credits for a person */
export function fetchPersonCredits(personId: number): Promise<PersonCredits> {
   return fetchAPI<PersonCredits>(`/people/${personId}/credits`);
}
