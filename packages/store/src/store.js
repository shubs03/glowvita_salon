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
