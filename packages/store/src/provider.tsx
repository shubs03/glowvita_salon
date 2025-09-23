'use client';

import { useRef, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { makeStore, RootState } from './store';

interface StoreProviderProps {
  children: ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  const storeRef = useRef<ReturnType<typeof makeStore> | null>(null);
  
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}

export default StoreProvider;
