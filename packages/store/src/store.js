import { configureStore } from '@reduxjs/toolkit';
import { glowvitaApi } from '../src/services/api.js';
import authReducer from './slices/auth-slice';
import modalReducer from './slices/modalSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      [glowvitaApi.reducerPath]: glowvitaApi.reducer,
      auth: authReducer,
      modal: modalReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(glowvitaApi.middleware),
  });
};
