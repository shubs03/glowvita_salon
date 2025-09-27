
"use client";

import { selectRootState } from '@repo/store/store.js';
import { useAppSelector } from '@repo/store/hooks';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { useAppDispatch } from '@repo/store/hooks';
import { clearCrmAuth, setCrmAuth } from "@repo/store/slices/crmAuthSlice";


// This hook is now specifically for the CRM panel.
export const useCrmAuth = () => {
  const { user, isCrmAuthenticated, token, role, permissions } = useAppSelector((state) => selectRootState(state).crmAuth);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // This logic runs on the client after the initial render.
    // The store is already pre-loaded, but we need to verify the cookie token.
    const cookieToken = Cookies.get('crm_access_token');
    
    if (cookieToken) {
      try {
        const decoded: { exp: number } = jwtDecode(cookieToken);
        if (decoded.exp * 1000 > Date.now()) {
          // Token is valid, ensure state is consistent
          if (!isCrmAuthenticated) {
             const storedState = localStorage.getItem('crmAuthState');
             if (storedState) {
               const { user, role, permissions } = JSON.parse(storedState);
               dispatch(setCrmAuth({ user, token: cookieToken, role, permissions }));
             }
          }
        } else {
          // Token expired
          dispatch(clearCrmAuth());
        }
      } catch (e) {
        // Invalid token
        dispatch(clearCrmAuth());
      }
    } else if (isCrmAuthenticated) {
      // State says logged in, but no cookie. Log out.
      dispatch(clearCrmAuth());
    }

    setIsLoading(false);

  }, [dispatch, isCrmAuthenticated]);

  return {
    user,
    isCrmAuthenticated,
    token,
    role,
    permissions,
    isLoading,
  };
};
