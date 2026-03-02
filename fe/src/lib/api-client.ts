import { REVALIDATE_TIME } from '@/constants';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

interface ApiError {
   readonly statusCode: number;
   readonly message: string;
   readonly error?: string;
}

interface FetchAPIOptions {
   readonly method?: string;
   readonly body?: unknown;
   readonly token?: string;
   readonly params?: Readonly<Record<string, string | number | undefined>>;
   readonly revalidate?: number | false;
   readonly cache?: RequestCache;
}

/**
 * Generic fetch helper for the NestJS API.
 * Handles auth headers, query params, error handling, and Next.js caching.
 *
 * @param path - API path (e.g. '/movies/trending')
 * @param options - Request options
 * @returns Parsed JSON response
 * @throws Error with message from the API on non-OK response
 */
export async function fetchAPI<T>(path: string, options: FetchAPIOptions = {}): Promise<T> {
   const { method = 'GET', body, token, params, revalidate, cache } = options;

   const url = new URL(`${API_URL}${path}`);
   if (params) {
      for (const [key, value] of Object.entries(params)) {
         if (value !== undefined && value !== null) {
            url.searchParams.set(key, String(value));
         }
      }
   }

   const headers: Record<string, string> = {};
   if (body) headers['Content-Type'] = 'application/json';
   if (token) headers['Authorization'] = `Bearer ${token}`;

   const nextOptions: NextFetchRequestConfig =
      revalidate !== undefined
         ? { revalidate: revalidate === false ? 0 : revalidate }
         : { revalidate: REVALIDATE_TIME };

   const response = await fetch(url.toString(), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      next: cache ? undefined : nextOptions,
      cache,
   });

   // Handle 204 No Content
   if (response.status === 204) return undefined as T;

   if (!response.ok) {
      const error = (await response.json().catch(() => ({
         message: `API error: ${response.status}`,
      }))) as ApiError;
      throw new Error(error.message);
   }

   return response.json() as Promise<T>;
}
