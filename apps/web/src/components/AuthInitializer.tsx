
"use client";

import { useAppDispatch } from '@repo/store/hooks';
import { clearUserAuth, setUserAuth, rehydrateAuth } from "@repo/store/slices/Web/userAuthSlice";
import { useEffect, type ReactNode } from 'react';
import Cookies from 'js-cookie';

// This component handles rehydrating the Redux state from localStorage
export function AuthInitializer({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    try {
      const storedState = localStorage.getItem('userAuthState');
      const token = Cookies.get('token');

      if (storedState && token) {
        const parsedState = JSON.parse(storedState);
        if (parsedState && parsedState.user && parsedState.token) {
            // Rehydrate the state from localStorage
            dispatch(rehydrateAuth(parsedState));
        } else {
          dispatch(clearUserAuth());
        }
      } else {
        // If there's no token or no stored state, ensure we are logged out.
        dispatch(clearUserAuth());
      }
    } catch (error) {
      console.error("Failed to process auth state from localStorage. Clearing session.", error);
      dispatch(clearUserAuth());
    }
  }, [dispatch]);

  return <>{children}</>;
}
