
"use client";

import { useAppDispatch } from '@repo/store/hooks';
import { setAdminAuth } from "@repo/store/slices/adminAuthSlice";
import { useEffect, type ReactNode } from 'react';

export function AuthInitializer({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    try {
      const storedState = localStorage.getItem('adminAuthState');
      if (storedState) {
        const { admin, token } = JSON.parse(storedState);
        if (admin && token) {
          dispatch(setAdminAuth({ user: admin, token }));
        }
      }
    } catch (error) {
      console.error("Failed to parse auth state from localStorage", error);
    }
  }, [dispatch]);

  return <>{children}</>;
}
