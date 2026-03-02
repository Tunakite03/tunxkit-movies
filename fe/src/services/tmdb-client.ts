/**
 * Re-export fetchAPI as fetchTMDB for backward compatibility.
 * All TMDB data is now fetched through the NestJS API.
 */
export { fetchAPI as fetchTMDB } from '@/lib/api-client';
