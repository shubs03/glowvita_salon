
import { createSlice } from '@reduxjs/toolkit';

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
});

export const { setCrmAuth, clearCrmAuth } = crmAuthSlice.actions;
export default crmAuthSlice.reducer;
