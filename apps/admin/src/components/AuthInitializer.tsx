
"use client";

import { useAppDispatch } from '@repo/store/hooks';
import { clearAdminAuth, setAdminAuth } from "@repo/store/slices/adminAuthSlice";
import { useEffect, type ReactNode } from 'react';

// This component handles rehydrating the Redux state from localStorage
export function AuthInitializer({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    try {
      const storedState = localStorage.getItem('adminAuthState');
      if (storedState) {
        const { admin, token } = JSON.parse(storedState);
        
        if (admin && token) {
            // Rehydrate the state without checking token expiry here.
            // Middleware will handle expired tokens.
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
