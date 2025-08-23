
"use client";

import { useAppDispatch } from '@repo/store/hooks';
import { clearCrmAuth, setCrmAuth } from "@repo/store/slices/crmAuthSlice";
import { useEffect, type ReactNode } from 'react';

export function CrmAuthInitializer({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    try {
      const storedState = localStorage.getItem('crmAuthState');
      if (storedState) {
        const { user, token, role, permissions } = JSON.parse(storedState);
        if (user && token && role) {
          // Rehydrate the state without checking token expiry here.
          // Middleware will handle expired tokens.
          dispatch(setCrmAuth({ user, token, role, permissions: permissions || [] }));
        } else {
          dispatch(clearCrmAuth());
        }
      }
    } catch (error) {
      console.error("Failed to process CRM auth state from localStorage. Clearing session.", error);
      dispatch(clearCrmAuth());
    }
  }, [dispatch]);

  return <>{children}</>;
}
