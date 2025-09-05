import { Store } from '@reduxjs/toolkit';
import { RootState } from './store';

declare module '@repo/store' {
  interface DefaultRootState extends RootState {}
}

declare module 'react-redux' {
  interface DefaultRootState extends RootState {}
}

declare module 'next' {
  interface NextPageContext {
    store: Store<RootState>;
  }
}
