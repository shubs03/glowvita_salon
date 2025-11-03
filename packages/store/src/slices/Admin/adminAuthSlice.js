import { createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

const initialState = {
  isAdminAuthenticated: false,
  admin: null,
  token: null,
};

// Function to safely load state from localStorage
const loadState = () => {
  try {
    // Check if localStorage is available
    if (typeof localStorage !== 'undefined') {
      const serializedState = localStorage.getItem('adminAuthState');
      if (serializedState === null) {
        return initialState;
      }
      const parsedState = JSON.parse(serializedState);
      // Basic validation of the stored state
      if (parsedState && typeof parsedState.isAdminAuthenticated === 'boolean') {
        return parsedState;
      }
    }
    return initialState;
  } catch (e) {
    console.error("Could not load auth state from localStorage", e);
    return initialState;
  }
};

const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState: loadState(),
  reducers: { 
    setAdminAuth: (state, action) => {
      const { user, token } = action.payload;
      state.isAdminAuthenticated = true;
      state.admin = user;
      state.token = token;

      // Persist state to localStorage only on the client-side
      if (typeof localStorage !== 'undefined') {
        try {
          const serializedState = JSON.stringify({
            isAdminAuthenticated: true,
            admin: user,
            token: token,
          });
          localStorage.setItem('adminAuthState', serializedState);
        } catch (e) {
          console.error("Could not save auth state to localStorage", e);
        }
      }
    },
    clearAdminAuth: (state) => {
      state.isAdminAuthenticated = false;
      state.admin = null;
      state.token = null;

      // Clear all possible auth data from localStorage and cookies
      if (typeof window !== 'undefined') {
        // Clear all possible auth data from localStorage
        localStorage.removeItem('adminAuthState');
        localStorage.removeItem('userAuthState');
        localStorage.removeItem('crmAuthState');
        
        // Clear all possible auth cookies
        Cookies.remove('token', { path: '/' });
        Cookies.remove('token', { path: '/', domain: window.location.hostname });
        Cookies.remove('crm_access_token', { path: '/' });
        Cookies.remove('crm_access_token', { path: '/', domain: window.location.hostname });
        Cookies.remove('access_token', { path: '/' });
        Cookies.remove('access_token', { path: '/', domain: window.location.hostname });
        
        // Clear any other possible tokens
        Object.keys(localStorage).forEach(key => {
          if (key.includes('token') || key.includes('auth')) {
            try {
              localStorage.removeItem(key);
            } catch (e) {
              console.warn(`Failed to remove localStorage item: ${key}`, e);
            }
          }
        });
      }
    },
  },
});

// Selectors
export const selectToken = (state) => state.adminAuth.token;
export const selectCurrentAdmin = (state) => state.adminAuth.admin;

export const { setAdminAuth, clearAdminAuth } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;