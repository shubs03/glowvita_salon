
"use client";

import { useAppDispatch } from '@repo/store/hooks';
import { clearUserAuth, setUserAuth } from "@repo/store/slices/userAuthSlice";
import { useEffect, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

export function AuthInitializer({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // This effect runs only once on the client-side after initial mount.
    try {
      const storedState = localStorage.getItem('userAuthState');
      if (storedState) {
        const { user, token, role, permissions } = JSON.parse(storedState);
        if (user && token && role) {
          // Rehydrate the state from localStorage if it exists
          dispatch(setUserAuth({ user, token, role, permissions: permissions || [] }));
        }
      }
    } catch (error) {
      console.error("AuthInitializer: Error processing auth state.", error);
      // Don't clear state here, let other parts of the app handle invalid states
    }
  }, [dispatch]);

  return <>{children}</>;
}
