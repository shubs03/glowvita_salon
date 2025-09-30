import { makeStore } from './store';

// Infer the type of makeStore
type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

declare module "@repo/store" {
  interface DefaultRootState extends RootState {}
}

declare module "react-redux" {
  interface DefaultRootState extends RootState {}
}
