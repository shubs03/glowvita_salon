import { createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import { glowvitaApi } from "@repo/store/services/api";

const initialState = {
  isCrmAuthenticated: undefined, // undefined: unchecked, false: not auth, true: auth
  user: null,
  token: null,
  role: null,
  permissions: [],
};

const crmAuthSlice = createSlice({
  name: 'crmAuth',
  initialState,
  reducers: { 
    setCrmAuth: (state, action) => {
      const { user, token, role, permissions } = action.payload;
      state.isCrmAuthenticated = true;
      state.user = user;
      state.token = token;
      state.role = role;
      state.permissions = permissions || [];

      if (typeof window !== 'undefined') {
        try {
          const stateToPersist = { 
            isCrmAuthenticated: true, 
            user, 
            token, 
            role, 
            permissions: permissions || [] 
          };
          localStorage.setItem('crmAuthState', JSON.stringify(stateToPersist));
        } catch (e) {
          console.error("Could not save CRM auth state to localStorage", e);
        }
      }
    },
    clearCrmAuth: (state) => {
      state.isCrmAuthenticated = false;
      state.user = null;
      state.token = null; 
      state.role = null;
      state.permissions = [];

      if (typeof window !== 'undefined') {
        // Clear all possible auth data from localStorage
        localStorage.removeItem('crmAuthState');
        localStorage.removeItem('userAuthState');
        localStorage.removeItem('adminAuthState');
        
        // Clear all possible auth cookies
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
    updateUser: (state, action) => {
      const incomingUser = action.payload;
      
      // Update the user with incoming data, always prioritizing fresh data from the server
      if (incomingUser?.subscription) {
        // Always update with the incoming subscription data from the server
        // The server should provide the most accurate subscription status
        state.user = incomingUser;
        
        // Update localStorage with the fresh data
        if (typeof window !== 'undefined') {
          try {
            const persistedState = JSON.parse(localStorage.getItem('crmAuthState'));
            if (persistedState) {
              const updatedState = { ...persistedState, user: state.user };
              localStorage.setItem('crmAuthState', JSON.stringify(updatedState));
            }
          } catch (e) {
            console.error("Could not update user in localStorage", e);
          }
        }
      } else {
        // No subscription data in incoming user, just update other fields
        state.user = {
          ...state.user,
          ...incomingUser
        };
        
        // Sync to localStorage
        if (typeof window !== 'undefined') {
          try {
            const persistedState = JSON.parse(localStorage.getItem('crmAuthState'));
            if (persistedState) {
              const updatedState = { ...persistedState, user: state.user };
              localStorage.setItem('crmAuthState', JSON.stringify(updatedState));
            }
          } catch (e) {
            console.error("Could not update user in localStorage", e);
          }
        }
      }
    },
    setSubscriptionExpired: (state) => {
      if (state.user) {
        const updatedUser = {
          ...state.user,
          subscription: {
            ...(state.user.subscription || {}),
            status: 'expired',
          },
        };
        state.user = updatedUser;

        if (typeof window !== 'undefined') {
          try {
            const persistedState = JSON.parse(localStorage.getItem('crmAuthState'));
            if (persistedState) {
              const updatedState = {
                ...persistedState,
                user: updatedUser,
              };
              localStorage.setItem('crmAuthState', JSON.stringify(updatedState));
            }
          } catch (e) {
            console.error("Could not update subscription status in localStorage", e);
          }
        }
      }
    },
    rehydrateAuth: (state, action) => {
      if (action.payload) {
        state.isCrmAuthenticated = action.payload.isCrmAuthenticated;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.role = action.payload.role;
        state.permissions = action.payload.permissions;
      } else {
        // Explicitly set to false when nothing is found in storage
        state.isCrmAuthenticated = false;
      }
    }
  },
});

export const { setCrmAuth, clearCrmAuth, rehydrateAuth, updateUser, setSubscriptionExpired } = crmAuthSlice.actions;

export const selectCrmAuth = (state) => ({
  isAuthenticated: state.crmAuth.isCrmAuthenticated,
  user: state.crmAuth.user,
  token: state.crmAuth.token,
  role: state.crmAuth.role,
  permissions: state.crmAuth.permissions || []
});

export const selectIsSubscriptionExpired = (state) => {
  const sub = state.crmAuth.user?.subscription;
  if (!sub) return true; // No subscription is treated as expired

  const isStatusExpired = sub.status?.toLowerCase() === 'expired';
  const isDateExpired = sub.endDate ? new Date(sub.endDate).getTime() <= new Date().getTime() : false;

  return isStatusExpired || isDateExpired;
};

export const handleSubscriptionExpired = () => (dispatch) => {
  dispatch(setSubscriptionExpired());
  dispatch(glowvitaApi.util.invalidateTags(['User']));
};

export default crmAuthSlice.reducer;