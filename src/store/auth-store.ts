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
}

interface AuthState {
   readonly token: string | null;
   readonly user: AuthUser | null;
   readonly isAuthenticated: boolean;
   readonly isHydrated: boolean;
}

interface AuthActions {
   readonly setAuth: (token: string, user: AuthUser) => void;
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
         user: null,
         isAuthenticated: false,
         isHydrated: false,

         setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
         updateUser: (updates) =>
            set((state) => ({
               user: state.user ? { ...state.user, ...updates } : null,
            })),
         logout: () => set({ token: null, user: null, isAuthenticated: false }),
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
