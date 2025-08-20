
"use client";

import { useAppDispatch } from '@repo/store/hooks';
import { setAdminAuth, clearAdminAuth } from '@repo/store/slices/auth';
import { useEffect, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  exp: number;
  [key: string]: any;
}

export function AuthInitializer({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    try {
      const storedState = localStorage.getItem('adminAuthState');
      if (storedState) {
        const { admin, token } = JSON.parse(storedState);
        
        if (admin && token) {
          const decodedToken: DecodedToken = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          
          if (decodedToken.exp > currentTime) {
            // Token is valid
            dispatch(setAdminAuth({ user: admin, token }));
          } else {
            // Token is expired
            console.warn("Expired token detected on app load. Clearing session.");
            dispatch(clearAdminAuth());
          }
        }
      }
    } catch (error) {
      console.error("Failed to process auth state from localStorage. Clearing session.", error);
      dispatch(clearAdminAuth());
    }
  }, [dispatch]);

  return <>{children}</>;
}
