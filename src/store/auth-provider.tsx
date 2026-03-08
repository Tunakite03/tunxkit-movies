'use client';

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

import { useAuthStore } from './auth-store';
import type { AuthUser } from './auth-store';
import { fetchAPI } from '@/lib/api-client';

/**
 * Validates the stored JWT token on mount.
 * If the token is invalid or expired, logs the user out.
 */
export function AuthProvider({ children }: { readonly children: ReactNode }) {
   const { token, isHydrated, updateUser, logout } = useAuthStore();
   const hasValidated = useRef(false);

   useEffect(() => {
      if (!isHydrated || hasValidated.current) return;
      hasValidated.current = true;

      if (!token) return;

      fetchAPI<AuthUser>('/auth/me', { token, revalidate: false, cache: 'no-store' })
         .then((user) => updateUser(user))
         .catch(() => logout());
   }, [isHydrated, token, updateUser, logout]);

   return <>{children}</>;
}
