import { configureStore } from '@reduxjs/toolkit';
import { glowvitaApi } from '../src/services/api.js';
import authReducer from './slices/auth-slice';
import modalReducer from './slices/modalSlice';
import customerReducer from './slices/customerSlice';
import salonReducer from './slices/salonSlice';
import supplierReducer from './slices/supplierSlice';
import refferalReducer from './slices/Admin/refferalSlice';
import notificationReducer from './slices/notificationSlice';
import geoFencingReducer from './slices/geoFencingSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      [glowvitaApi.reducerPath]: glowvitaApi.reducer,
      auth: authReducer,
      modal: modalReducer,
      customer: customerReducer,
      salon: salonReducer,
      suppliers: supplierReducer,
      refferal: refferalReducer,
      notification: notificationReducer,
      geoFencing: geoFencingReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(glowvitaApi.middleware),
  });
};

export const selectRootState = (state) => state;
