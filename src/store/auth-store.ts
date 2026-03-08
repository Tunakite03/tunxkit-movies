'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Authenticated user profile from the NestJS API */
export interface AuthUser {
   readonly id: string;
   readonly name: string | null;
   readonly email: string;
   readonly image: string | null;
   readonly role: string;
   readonly createdAt?: string;
   readonly emailVerified?: string | null;
}

interface AuthState {
   readonly token: string | null;
   readonly refreshToken: string | null;
   readonly user: AuthUser | null;
   readonly isAuthenticated: boolean;
   readonly isHydrated: boolean;
}

interface AuthActions {
   readonly setAuth: (token: string, refreshToken: string, user: AuthUser) => void;
   readonly setTokens: (token: string, refreshToken: string) => void;
   readonly updateUser: (updates: Partial<AuthUser>) => void;
   readonly logout: () => void;
   readonly setHydrated: () => void;
}

type AuthStore = AuthState & AuthActions;

/**
 * Zustand store for JWT authentication.
 * Persists token + user to localStorage via zustand/persist.
 *
 * @example
 * ```ts
 * const { user, token, isAuthenticated, setAuth, logout } = useAuthStore();
 * ```
 */
export const useAuthStore = create<AuthStore>()(
   persist(
      (set) => ({
         token: null,
         refreshToken: null,
         user: null,
         isAuthenticated: false,
         isHydrated: false,

         setAuth: (token, refreshToken, user) =>
            set({ token, refreshToken, user, isAuthenticated: true }),
         setTokens: (token, refreshToken) => set({ token, refreshToken }),
         updateUser: (updates) =>
            set((state) => ({
               user: state.user ? { ...state.user, ...updates } : null,
            })),
         logout: () => set({ token: null, refreshToken: null, user: null, isAuthenticated: false }),
         setHydrated: () => set({ isHydrated: true }),
      }),
      {
         name: 'tunxkit-auth',
         onRehydrateStorage: () => (state) => {
            state?.setHydrated();
         },
      },
   ),
);
