
"use client";

import { useAppDispatch } from '@repo/store/hooks';
import { setAdminAuth, clearAdminAuth } from '@repo/store/slices/auth';
import { useEffect, type ReactNode } from 'react';

// NOTE: JWT decoding is now handled by server-side middleware for security.
// This component's responsibility is to rehydrate the Redux state from localStorage
// so that the UI can reflect the logged-in user's information.
// The middleware is the source of truth for whether a user is truly authenticated.

export function AuthInitializer({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    try {
      const storedState = localStorage.getItem('adminAuthState');
      if (storedState) {
        const { admin, token } = JSON.parse(storedState);
        if (admin && token) {
          // Rehydrate the state. The middleware will have already validated the token.
          dispatch(setAdminAuth({ user: admin, token }));
        } else {
          // If state is malformed, clear it
          dispatch(clearAdminAuth());
        }
      }
    } catch (error) {
      console.error("Failed to process auth state from localStorage. Clearing session.", error);
      dispatch(clearAdminAuth());
    }
  }, [dispatch]);

  return <>{children}</>;
}
