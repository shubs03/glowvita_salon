import { createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

const initialState = {
  isAuthenticated: undefined, // undefined: unchecked, false: not auth, true: auth
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
      state.isAuthenticated = true;
      state.user = user;
      state.token = token;
      state.role = role || 'USER';
      state.permissions = permissions || [];

      if (typeof window !== 'undefined') {
        try {
          const stateToPersist = { 
            isAuthenticated: true, 
            user, 
            token, 
            role: role || 'USER', 
            permissions: permissions || [] 
          };
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

      if (typeof window !== 'undefined') {
        localStorage.removeItem('userAuthState');
        Cookies.remove('token', { path: '/' });
      }
    },
    rehydrateAuth: (state, action) => {
      if (action.payload) {
        state.isAuthenticated = action.payload.isAuthenticated;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.role = action.payload.role;
        state.permissions = action.payload.permissions;
      } else {
        state.isAuthenticated = false;
      }
    }
  },
});

export const { setUserAuth, clearUserAuth, rehydrateAuth } = userAuthSlice.actions;

export const selectUserAuth = (state) => ({
  isAuthenticated: state.userAuth.isAuthenticated,
  user: state.userAuth.user,
  token: state.userAuth.token,
  role: state.userAuth.role,
  permissions: state.userAuth.permissions || [],
});

export default userAuthSlice.reducer;
