
import { configureStore } from '@reduxjs/toolkit';
import { glowvitaApi } from '../src/services/api.js';
import adminAuthReducer from '@repo/store/slices/adminAuthSlice';
import crmAuthReducer from '@repo/store/slices/crmAuthSlice';
import modalReducer from './slices/modalSlice';
import customerReducer from './slices/customerSlice';
import salonReducer from './slices/salonSlice';
import vendorReducer from './slices/vendorSlice';
import marketingReducer from './slices/marketingSlice';
import supplierReducer from './slices/supplierSlice';
import subscriptionReducer from './slices/subscriptionSlice';
import notificationReducer from './slices/notificationSlice';
import geoFencingReducer from './slices/geoFencingSlice';
import refferalReducer from './slices/Admin/refferalSlice.js';
import faqReducer from './slices/faqSlice';
import serviceReducer from "./slices/CRM/serviceSlice.js";

export const makeStore = () => {
  return configureStore({
    reducer: {
      [glowvitaApi.reducerPath]: glowvitaApi.reducer,
      adminAuth: adminAuthReducer,
      crmAuth: crmAuthReducer,
      modal: modalReducer,
      customer: customerReducer,
      salon: salonReducer,
      vendors: vendorReducer,
      marketing: marketingReducer,
      suppliers: supplierReducer,
      subscription: subscriptionReducer,
      notification: notificationReducer,
      geoFencing: geoFencingReducer,
      refferal: refferalReducer,
      faqs: faqReducer,
      service: serviceReducer
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(glowvitaApi.middleware),
  });
};

export const selectRootState = (state) => state;
