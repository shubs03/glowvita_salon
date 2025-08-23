import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
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
import shippingReducer from './slices/shippingSlice';
import productReducer from './slices/productSlice';
import serviceReducer from "./slices/CRM/serviceSlice.js";
import staffReducer from "./slices/CRM/staffSlice.js"; // Import staff slice

export const makeStore = () => {
  return configureStore({
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(glowvitaApi.middleware),
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
      faq: faqReducer,
      shipping: shippingReducer,
      products: productReducer,,
      service: serviceReducer,
      staff: staffReducer, // Add staff reducer
    },
  });
};

export const selectRootState = (state) => state;