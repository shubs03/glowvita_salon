
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: false, // Changed from undefined to false
  user: null,
  token: null, // Use null to indicate "checked and not logged in"
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

      // Persist state to localStorage only on the client-side
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
      state.token = null;
      state.role = null;
      state.permissions = [];

      // Clear localStorage only on the client-side
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
