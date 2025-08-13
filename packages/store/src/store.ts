
import { configureStore } from '@reduxjs/toolkit';
import { authApi } from './apis/example-api';
import authReducer from './slices/auth-slice';
import modalReducer from './slices/modalSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      [authApi.reducerPath]: authApi.reducer,
      auth: authReducer,
      modal: modalReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(authApi.middleware),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
