
import { createSlice } from '@reduxjs/toolkit';
import { glowvitaApi } from '../services/api.js';

const initialState = {
  isCrmAuthenticated: false,
  user: null,
  token: undefined, // Use `undefined` to indicate "not yet checked"
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

      // Persist state to localStorage only on the client-side
      if (typeof window !== 'undefined') {
        try {
          const stateToPersist = { user, role, permissions: permissions || [] };
          localStorage.setItem('crmAuthState', JSON.stringify(stateToPersist));
        } catch (e) {
          console.error("Could not save CRM auth state to localStorage", e);
        }
      }
    },
    clearCrmAuth: (state) => {
      state.isCrmAuthenticated = false;
      state.user = null;
      state.token = null; // Set to null to indicate "checked and logged out"
      state.role = null;
      state.permissions = [];

      // Clear localStorage only on the client-side
      if (typeof window !== 'undefined') {
        localStorage.removeItem('crmAuthState');
      }
    },
  },
  extraReducers: (builder) => {
    // This extraReducer will listen for the `clearCrmAuth` action and trigger the API reset.
    builder.addMatcher(
        (action) => action.type === 'crmAuth/clearCrmAuth',
        (state, action) => {
          // This is a placeholder. The actual API reset will be done in the root store.
        }
      )
  },
});

export const { setCrmAuth, clearCrmAuth } = crmAuthSlice.actions;

export const selectCrmAuth = (state) => ({
  isAuthenticated: state.crmAuth.isCrmAuthenticated,
  user: state.crmAuth.user,
  token: state.crmAuth.token,
  role: state.crmAuth.role,
  permissions: state.crmAuth.permissions || []
});

export default crmAuthSlice.reducer;
