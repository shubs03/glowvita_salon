
"use client";

import { useAppDispatch } from '@repo/store/hooks';
import { clearAdminAuth, setAdminAuth } from "@repo/store/slices/adminAuthSlice";
import { useEffect, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

// This component handles rehydrating the Redux state from localStorage
// and ensures that expired tokens are cleared on load.
export function AuthInitializer({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    try {
      const storedState = localStorage.getItem('adminAuthState');
      if (storedState) {
        const { admin, token } = JSON.parse(storedState);
        
        if (admin && token) {
          const decodedToken: { exp: number } = jwtDecode(token);
          // Check if token is expired
          if (decodedToken.exp * 1000 < Date.now()) {
            dispatch(clearAdminAuth());
          } else {
            // Rehydrate the state if token is valid
            dispatch(setAdminAuth({ user: admin, token }));
          }
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
