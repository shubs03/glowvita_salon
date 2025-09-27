import { createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

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
        localStorage.removeItem('crmAuthState');
        Cookies.remove('crm_access_token', { path: '/' });
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

export const { setCrmAuth, clearCrmAuth, rehydrateAuth } = crmAuthSlice.actions;

export const selectCrmAuth = (state) => ({
  isAuthenticated: state.crmAuth.isCrmAuthenticated,
  user: state.crmAuth.user,
  token: state.crmAuth.token,
  role: state.crmAuth.role,
  permissions: state.crmAuth.permissions || []
});

export default crmAuthSlice.reducer;
