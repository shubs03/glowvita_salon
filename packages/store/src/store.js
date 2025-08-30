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
import appointmentReducer from './slices/appointmentSlice';
import blockTimeReducer from './slices/blockTimeSlice';
  
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
      shipping: shippingReducer,
      products: productReducer,
      staff: staffReducer, 
      faqs: faqReducer,
      service: serviceReducer,
      appointments: appointmentReducer,  
      blockTime: blockTimeReducer
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // Ignore these action types
          ignoredActions: [
            'blockTime/saveBlockTime/pending', 
            'blockTime/saveBlockTime/fulfilled', 
            'blockTime/saveBlockTime/rejected',
            'blockTime/setDate',
            'blockTime/setStaffMember',
            'blockTime/setStartTime',
            'blockTime/setEndTime',
            'blockTime/setDescription',
            'blockTime/reset'
          ],
          // Ignore these field paths in all actions
          ignoredActionPaths: ['meta.arg', 'payload.timestamp', 'payload'],
          // Ignore these paths in the state
          ignoredPaths: ['blockTime.date', 'blockTime']
        }
      }).concat(glowvitaApi.middleware),
  });
};

export const selectRootState = (state) => state;