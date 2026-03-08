'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { useAuthStore } from '@/store/auth-store';
import { fetchAPI } from '@/lib/api-client';
import type { AuthUser } from '@/store/auth-store';

/**
 * Handles the Google OAuth callback.
 * Extracts JWT token from URL, validates it, stores auth state, and redirects.
 */
export default function GoogleCallbackPage() {
   const searchParams = useSearchParams();
   const router = useRouter();
   const { setAuth, logout } = useAuthStore();
   const hasProcessed = useRef(false);

   useEffect(() => {
      if (hasProcessed.current) return;
      hasProcessed.current = true;

      const token = searchParams.get('token');
      const refreshToken = searchParams.get('refreshToken');

      if (!token || !refreshToken) {
         router.replace('/sign-in');
         return;
      }

      // Validate token by fetching user profile, then store auth state
      fetchAPI<AuthUser>('/auth/me', { token, revalidate: false, cache: 'no-store' })
         .then((user) => {
            setAuth(token, refreshToken, user);
            router.replace('/');
         })
         .catch(() => {
            logout();
            router.replace('/sign-in');
         });
   }, [searchParams, router, setAuth, logout]);

   return (
      <div className="flex min-h-screen items-center justify-center">
         <div className="flex flex-col items-center gap-3">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Đang xử lý đăng nhập...</p>
         </div>
      </div>
   );
}
