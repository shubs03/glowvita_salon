import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { glowvitaApi } from '../src/services/api.js';
import adminAuthReducer from './slices/Admin/adminAuthSlice.js';
import userAuthReducer, { rehydrateAuth as rehydrateUserAuth } from './slices/Web/userAuthSlice.js';
import crmAuthReducer, { rehydrateAuth as rehydrateCrmAuth } from './slices/crmAuthSlice.js';
import modalReducer from './slices/modalSlice.js';
import customerReducer from './slices/customerSlice.js';
import salonReducer from './slices/salonSlice.js';
import vendorReducer from './slices/vendorSlice.js';
import marketingReducer from './slices/marketingslice.js';
import supplierReducer from './slices/supplierSlice.js';
import subscriptionReducer from './slices/subscriptionSlice.js';
import notificationReducer from './slices/notificationSlice.js';
import geoFencingReducer from './slices/geoFencingSlice.js';
import refferalReducer from './slices/Admin/refferalSlice.js';
import faqReducer from './slices/faqSlice.js';
import shippingReducer from './slices/shippingSlice.js';
import productReducer from './slices/productSlice.js';
import serviceReducer from "./slices/CRM/serviceSlice.js";
import staffReducer from "./slices/CRM/staffSlice.js";
import clientReducer from "./slices/CRM/clientSlice.js";
import appointmentReducer from './slices/appointmentSlice.js';
import blockTimeReducer from './slices/blockTimeSlice.js';
import vendorprofileReducer from './slices/vendorProfileSlice.js';
import workingHoursReducer from './slices/workingHoursSlice.js';
import orderReducer from './slices/orderSlice.js';
import calendarAppointmentReducer from './slices/calendarAppointmentSlice.js';
import cartReducer from './slices/cartSlice.js';
import smsTemplateSlice from './slices/smsTemplateSlice.js';
import patientReducer from './slices/patientSlice.js';
import staffAvailabilityServiceReducer from './slices/staffAvailabilityService';

// Import localStorage cleanup utility
import './utils/localStorage-cleanup.js';

const appReducer = combineReducers({
  [glowvitaApi.reducerPath]: glowvitaApi.reducer,
  adminAuth: adminAuthReducer,
  crmAuth: crmAuthReducer,
  userAuth: userAuthReducer,
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
  client: clientReducer,
  faqs: faqReducer,
  service: serviceReducer,
  appointments: appointmentReducer,  
  blockTime: blockTimeReducer,
  vendorprofile: vendorprofileReducer,
  workingHours: workingHoursReducer,
  order: orderReducer,
  calendarAppointments: calendarAppointmentReducer,
  cart: cartReducer,
  staffAvailabilityService: staffAvailabilityServiceReducer,

  smsTemplates: smsTemplateSlice,
  patients: patientReducer,
});

  
const rootReducer = (state, action) => {
  if (action.type === 'crmAuth/clearCrmAuth' || action.type === 'userAuth/clearUserAuth' || action.type === 'adminAuth/clearAdminAuth') {
    // Keep API state, reset everything else
    const { [glowvitaApi.reducerPath]: api, ...restState } = state;
    return {
      ...appReducer(undefined, action), // Reset all slices to initial state
      [glowvitaApi.reducerPath]: api,  // Preserve the API slice
    };
  }
  return appReducer(state, action);
};

export const makeStore = () => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [
            'userAuth/setUserAuth', 'userAuth/rehydrateAuth',
            'crmAuth/setCrmAuth', 'crmAuth/rehydrateAuth',
            'adminAuth/setAdminAuth', 'adminAuth/rehydrateAuth',
          ],
          ignoredPaths: ['userAuth.user', 'crmAuth.user', 'adminAuth.admin'],
        }
      }).concat(glowvitaApi.middleware),
  });
};

// Function to handle client-side rehydration
export const rehydrateStore = (store) => {
  if (typeof window === 'undefined') return;

  try {
    const userAuthState = localStorage.getItem('userAuthState');
    if (userAuthState) {
      console.log("Rehydrating user auth state from localStorage");
      store.dispatch(rehydrateUserAuth(JSON.parse(userAuthState)));
    } else {
      console.log("No user auth state found in localStorage, setting to unauthenticated");
      // Explicitly set auth to false if nothing is in storage
      store.dispatch(rehydrateUserAuth(null));
    }
  } catch (e) {
    console.error("Could not rehydrate user auth state from localStorage", e);
    store.dispatch(rehydrateUserAuth(null));
  }

  try {
    const crmAuthState = localStorage.getItem('crmAuthState');
    if (crmAuthState) {
      console.log("Rehydrating CRM auth state from localStorage");
      store.dispatch(rehydrateCrmAuth(JSON.parse(crmAuthState)));
    } else {
      console.log("No CRM auth state found in localStorage");
      store.dispatch(rehydrateCrmAuth(null));
    }
  } catch (e) {
    console.error("Could not rehydrate CRM auth state from localStorage", e);
    store.dispatch(rehydrateCrmAuth(null));
  }
};

export const selectRootState = (state) => state;

// Create and export store instance
export const store = makeStore();