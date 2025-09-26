'use client';

import { useRef, useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { makeStore } from './store';
import { setUserAuth, clearUserAuth } from './slices/Web/userAuthSlice';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';


// Component to handle auth state initialization
function AuthInitializer({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    try {
      const token = Cookies.get('token');
      const storedState = localStorage.getItem('userAuthState');
      
      if (token && storedState) {
        const decodedToken = jwtDecode(token);
        if (decodedToken.exp * 1000 > Date.now()) {
          const { user, role, permissions } = JSON.parse(storedState);
          if (user && role) {
            dispatch(setUserAuth({ user, token, role, permissions: permissions || [] }));
            return;
          }
        }
      }
      // If any check fails, ensure we have a clean state
      dispatch(clearUserAuth());
    } catch (error) {
      console.error("AuthInitializer: Error processing auth state.", error);
      dispatch(clearUserAuth());
    }
  }, [dispatch]);

  return <>{children}</>;
}


export default function StoreProvider({ children }) {
  const storeRef = useRef(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return (
    <Provider store={storeRef.current}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}
