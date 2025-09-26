
"use client";

import { useAppDispatch } from '@repo/store/hooks';
import { clearUserAuth, setUserAuth } from '@repo/store/slices/userAuthSlice';
import { useEffect, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

export function AuthInitializer({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    try {
      const token = Cookies.get('token');
      const storedState = localStorage.getItem('userAuthState');
      
      if (token && storedState) {
        const decodedToken: { exp: number } = jwtDecode(token);

        if (decodedToken.exp * 1000 > Date.now()) {
          // Token is valid and not expired, rehydrate the state
          const { user, role, permissions } = JSON.parse(storedState);
          if (user && token && role) {
            dispatch(setUserAuth({ user, token, role, permissions: permissions || [] }));
            return; 
          }
        }
      }
      
      dispatch(clearUserAuth());
      
    } catch (error) {
      console.error("AuthInitializer: Error processing auth state.", error);
      dispatch(clearUserAuth());
    }
  }, [dispatch]);

  return <>{children}</>;
}
