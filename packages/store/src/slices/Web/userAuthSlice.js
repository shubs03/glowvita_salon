import { createSlice } from '@reduxjs/toolkit';

// The slice should not be responsible for loading its own state from localStorage.
// This is an external concern that should be handled by an initializer component.
const initialState = {
  isAuthenticated: false,
  user: null,
  token: undefined, // Use `undefined` to indicate "not yet checked" state
  role: null,
  permissions: [],
};

const userAuthSlice = createSlice({
  name: 'userAuth',
  initialState,
  reducers: {
    setUserAuth: (state, action) => {
      const { user, token, role, permissions } = action.payload;
      state.isAuthenticated = true;
      state.user = user;
      state.token = token;
      state.role = role;
      state.permissions = permissions || [];

      if (typeof localStorage !== 'undefined') {
        try {
          const stateToPersist = { user, role, permissions: permissions || [] };
          localStorage.setItem('userAuthState', JSON.stringify(stateToPersist));
        } catch (e) {
          console.error("Could not save user auth state to localStorage", e);
        }
      }
    },
    clearUserAuth: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null; // Set to null to indicate "checked and logged out"
      state.role = null;
      state.permissions = [];

      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('userAuthState');
      }
    },
  },
});

export const { setUserAuth, clearUserAuth } = userAuthSlice.actions;

export const selectUserAuth = (state) => ({
  isAuthenticated: state.userAuth.isAuthenticated,
  user: state.userAuth.user,
  token: state.userAuth.token,
  role: state.userAuth.role,
  permissions: state.userAuth.permissions || [],
});

export default userAuthSlice.reducer;
