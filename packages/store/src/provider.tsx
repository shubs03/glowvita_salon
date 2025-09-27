'use client';

import { useRef, ReactNode, useEffect } from 'react';
import { Provider } from 'react-redux';
import { makeStore, rehydrateStore } from './store';

interface StoreProviderProps {
  children: ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  const storeRef = useRef<ReturnType<typeof makeStore> | null>(null);
  
  if (!storeRef.current) {
    storeRef.current = makeStore();
    // Rehydrate the store on the client side
    rehydrateStore(storeRef.current);
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}

export default StoreProvider;
