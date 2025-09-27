
import { createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  role: null,
  permissions: [],
};

const userAuthSlice = createSlice({
  name: 'userAuth',
  initialState,
  reducers: {
    setUserAuth: (state, action) => {
      const { user, token, role, permissions } = action.payload;
      state.isAuthenticated = !!(user && token && role);
      state.user = user;
      state.token = token;
      state.role = role;
      state.permissions = permissions || [];

      // Persist state to localStorage only on the client-side
      if (typeof window !== 'undefined') {
        try {
          const stateToPersist = { user, token, role, permissions: permissions || [], isAuthenticated: true };
          localStorage.setItem('userAuthState', JSON.stringify(stateToPersist));
        } catch (e) {
          console.error("Could not save auth state to localStorage", e);
        }
      }
    },
    clearUserAuth: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.role = null;
      state.permissions = [];

      // Clear localStorage and cookies only on the client-side
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userAuthState');
        Cookies.remove('token');
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
