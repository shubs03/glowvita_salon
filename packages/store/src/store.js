
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { glowvitaApi } from '../src/services/api.js';
import adminAuthReducer from './slices/Admin/adminAuthSlice';
import userAuthReducer from './slices/Web/userAuthSlice';
import crmAuthReducer from '@repo/store/slices/crmAuthSlice';
import modalReducer from './slices/modalSlice';
import customerReducer from './slices/customerSlice';
import salonReducer from './slices/salonSlice';
import vendorReducer from './slices/vendorSlice';
import marketingReducer from './slices/marketingslice';
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
import clientReducer from "./slices/CRM/clientSlice.js"; // Import client slice
import appointmentReducer from './slices/appointmentSlice';
import blockTimeReducer from './slices/blockTimeSlice';
import vendorprofileReducer from './slices/vendorprofileSlice';
import workingHoursReducer from './slices/workingHoursSlice';
import orderReducer from './slices/orderSlice';
import calendarAppointmentReducer from './slices/calendarAppointmentSlice';
import cartReducer from './slices/cartSlice'; // Import the new cart reducer
import smsTemplateSlice from './slices/smsTemplateSlice.js';

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
  smsTemplates: smsTemplateSlice,
});
  
const rootReducer = (state, action) => {
  if (action.type === 'crmAuth/clearCrmAuth' || action.type === 'userAuth/clearUserAuth' || action.type === 'adminAuth/clearAdminAuth') {
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};

// Function to safely load CRM auth state from localStorage
const loadCrmAuthState = () => {
  if (typeof window === 'undefined') {
    return undefined;
  }
  try {
    const serializedState = localStorage.getItem('crmAuthState');
    if (serializedState === null) {
      return { isCrmAuthenticated: false, user: null, token: null, role: null, permissions: [] };
    }
    const parsed = JSON.parse(serializedState);
    // On initial load, we assume the token from the cookie is valid.
    // Middleware will handle redirects if it's not.
    return { ...parsed, isCrmAuthenticated: !!parsed.user, token: "pending" };
  } catch (err) {
    console.error("Could not load CRM auth state from localStorage", err);
    return { isCrmAuthenticated: false, user: null, token: null, role: null, permissions: [] };
  }
};

// Function to safely load Web auth state from localStorage
const loadUserAuthState = () => {
  if (typeof window === 'undefined') {
    return undefined;
  }
  try {
    const serializedState = localStorage.getItem('userAuthState');
    if (serializedState === null) {
      return { isAuthenticated: false, user: null, token: null, role: null, permissions: [] };
    }
    const parsed = JSON.parse(serializedState);
    return { ...parsed, isAuthenticated: !!parsed.user, token: "pending" };
  } catch (err) {
    console.error("Could not load user auth state from localStorage", err);
    return { isAuthenticated: false, user: null, token: null, role: null, permissions: [] };
  }
};

export const makeStore = () => {
  const preloadedState = {
    userAuth: loadUserAuthState(),
    crmAuth: loadCrmAuthState(),
    // You can add preloading for adminAuth here as well if needed
  };

  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
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
          ignoredActionPaths: ['meta.arg', 'payload.timestamp', 'payload'],
          ignoredPaths: ['blockTime.date', 'blockTime']
        }
      }).concat(glowvitaApi.middleware),
  });
};

export const selectRootState = (state) => state;
