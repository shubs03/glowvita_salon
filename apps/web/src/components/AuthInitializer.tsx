
"use client";

import { useAppDispatch } from '@repo/store/hooks';
import { clearUserAuth, setUserAuth } from "@repo/store/slices/userAuthSlice";
import { useEffect, type ReactNode } from 'react';

// This component handles rehydrating the Redux state from localStorage
export function AuthInitializer({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    try {
      const storedState = localStorage.getItem('userAuthState');
      if (storedState) {
        const { user, token, role, permissions } = JSON.parse(storedState);
        
        if (user && token) {
            // Rehydrate the state without checking token expiry here.
            // Middleware will handle expired tokens.
            dispatch(setUserAuth({ user, token, role, permissions }));
        } else {
          // If state is malformed, clear it
          dispatch(clearUserAuth());
        }
      }
    } catch (error) {
      console.error("Failed to process auth state from localStorage. Clearing session.", error);
      dispatch(clearUserAuth());
    }
  }, [dispatch]);

  return <>{children}</>;
}
