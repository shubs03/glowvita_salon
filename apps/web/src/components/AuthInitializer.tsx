
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
      const storedState = localStorage.getItem('userAuthState');
      const token = Cookies.get('token');
      
      if (storedState && token) {
        const { user, role } = JSON.parse(storedState);
        const decodedToken: { exp: number } = jwtDecode(token);

        if (user && token && decodedToken.exp * 1000 > Date.now()) {
          dispatch(setUserAuth({ user, token, role }));
        } else {
          dispatch(clearUserAuth());
          Cookies.remove('token');
        }
      }
    } catch (error) {
      console.error("Failed to process auth state from localStorage.", error);
      dispatch(clearUserAuth());
    }
  }, [dispatch]);

  return <>{children}</>;
}
