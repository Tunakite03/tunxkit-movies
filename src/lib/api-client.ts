import { REVALIDATE_TIME } from '@/constants';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

interface ApiError {
   readonly statusCode: number;
   readonly message: string;
   readonly error?: string;
}

interface AuthTokens {
   readonly accessToken: string;
   readonly refreshToken: string;
   readonly user: {
      readonly id: string;
      readonly name: string | null;
      readonly email: string;
      readonly image: string | null;
      readonly role: string;
      readonly createdAt?: string;
      readonly emailVerified?: string | null;
   };
}

interface FetchAPIOptions {
   readonly method?: string;
   readonly body?: unknown;
   readonly token?: string;
   readonly params?: Readonly<Record<string, string | number | undefined>>;
   readonly revalidate?: number | false;
   readonly cache?: RequestCache;
}

// Prevent concurrent refresh attempts
let refreshPromise: Promise<string | null> | null = null;

/** Attempt to refresh the access token. Returns new token or null. */
async function tryRefreshToken(): Promise<string | null> {
   if (typeof window === 'undefined') return null;

   // Dynamic import to avoid circular dependency at module level
   const { useAuthStore } = await import('@/store/auth-store');
   const { refreshToken } = useAuthStore.getState();
   if (!refreshToken) return null;

   if (refreshPromise) return refreshPromise;

   refreshPromise = (async () => {
      try {
         const res = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
         });

         if (!res.ok) {
            useAuthStore.getState().logout();
            return null;
         }

         const data = (await res.json()) as AuthTokens;
         useAuthStore.getState().setAuth(data.accessToken, data.refreshToken, data.user);
         return data.accessToken;
      } catch {
         useAuthStore.getState().logout();
         return null;
      } finally {
         refreshPromise = null;
      }
   })();

   return refreshPromise;
}

/**
 * Generic fetch helper for the NestJS API.
 * Handles auth headers, query params, error handling, Next.js caching,
 * and automatic token refresh on 401.
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

   // On 401 with an authenticated request, attempt token refresh (client-side only)
   if (response.status === 401 && token && !path.startsWith('/auth/')) {
      const newToken = await tryRefreshToken();
      if (newToken) {
         return fetchAPI<T>(path, { ...options, token: newToken });
      }
   }

   if (!response.ok) {
      const error = (await response.json().catch(() => ({
         message: `API error: ${response.status}`,
      }))) as ApiError;
      throw new Error(error.message);
   }

   return response.json() as Promise<T>;
}
