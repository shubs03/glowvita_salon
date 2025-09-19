
import { createSlice } from '@reduxjs/toolkit';
import { glowvitaApi } from '../services/api';

const initialState = {
  isCrmAuthenticated: false,
  user: null,
  token: null,
  role: null,
  permissions: [],
};

const loadCrmState = () => {
  try {
    if (typeof localStorage !== 'undefined') {
      const serializedState = localStorage.getItem('crmAuthState');
      if (serializedState === null) {
        return initialState;
      }
      const parsedState = JSON.parse(serializedState);
      if (parsedState && typeof parsedState.isCrmAuthenticated === 'boolean') {
        return parsedState;
      }
    }
    return initialState;
  } catch (e) {
    console.error("Could not load CRM auth state from localStorage", e);
    return initialState;
  }
};

const crmAuthSlice = createSlice({
  name: 'crmAuth',
  initialState: loadCrmState(),
  reducers: { 
    setCrmAuth: (state, action) => {
      const { user, token, role, permissions } = action.payload;
      state.isCrmAuthenticated = true;
      state.user = user;
      state.token = token;
      state.role = role;
      state.permissions = permissions || [];

      if (typeof localStorage !== 'undefined') {
        try {
          const serializedState = JSON.stringify({
            isCrmAuthenticated: true,
            user,
            token,
            role,
            permissions: permissions || [],
          });
          localStorage.setItem('crmAuthState', serializedState);
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

      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('crmAuthState');
      }
    },
  },
  extraReducers: (builder) => {
    // When clearCrmAuth is dispatched, also reset the API state to clear cached data like the cart.
    builder.addCase(clearCrmAuth, (state, action) => {
      // This is a special action that RTK Query provides to reset the API state
      return glowvitaApi.util.resetApiState();
    });
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