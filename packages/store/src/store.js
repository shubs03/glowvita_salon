
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { glowvitaApi } from '../src/services/api.js';
import adminAuthReducer from './slices/Admin/adminAuthSlice.js';
import userAuthReducer from './slices/Web/userAuthSlice.js';
import crmAuthReducer from './slices/crmAuthSlice.js';
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
import staffReducer from "./slices/CRM/staffSlice.js"; // Import staff slice
import clientReducer from "./slices/CRM/clientSlice.js"; // Import client slice
import appointmentReducer from './slices/appointmentSlice.js';
import blockTimeReducer from './slices/blockTimeSlice.js';
import vendorprofileReducer from './slices/vendorprofileSlice.js';
import workingHoursReducer from './slices/workingHoursSlice.js';
import orderReducer from './slices/orderSlice.js';
import calendarAppointmentReducer from './slices/calendarAppointmentSlice.js';
import cartReducer from './slices/cartSlice.js'; // Import the new cart reducer
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
    // This will reset all state to initial state by passing undefined.
    // It also triggers the API state reset.
    state = undefined; 
  }
  return appReducer(state, action);
};

// Function to safely load state from localStorage
const loadStateFromStorage = (key) => {
  // We only want to load from localStorage on the client-side
  if (typeof window === 'undefined') {
    return undefined;
  }
  try {
    const serializedState = localStorage.getItem(key);
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error(`Could not load ${key} from localStorage`, err);
    return undefined;
  }
};


export const makeStore = () => {
  const preloadedState = {
    crmAuth: loadStateFromStorage('crmAuthState'),
    userAuth: loadStateFromStorage('userAuthState'),
    // Add any other slices you want to rehydrate from localStorage
  };

  return configureStore({
    reducer: rootReducer,
    // Conditionally add preloadedState only if it's not empty
    preloadedState: Object.keys(preloadedState).length > 0 ? preloadedState : undefined,
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

