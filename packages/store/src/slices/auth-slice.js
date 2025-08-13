
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // For web app (USER role)
  isAuthenticated: false,
  user: null,

  // For admin app (ADMIN/SUPERADMIN roles)
  isAdminAuthenticated: false,
  admin: null,
  token: null,
};

// Function to load state from localStorage
const loadState = () => {
    try {
        const serializedState = localStorage.getItem('adminAuthState');
        if (serializedState === null) {
            return initialState;
        }
        const loadedState = JSON.parse(serializedState);
        return { ...initialState, ...loadedState };
    } catch (e) {
        return initialState;
    }
};

const authSlice = createSlice({
  name: 'auth',
  initialState: loadState(),
  reducers: {
    setAuth: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    clearAuth: (state) => {
      state.isAuthenticated = false;
      state.user = null;
    },
    setAdminAuth: (state, action) => {
      state.isAdminAuthenticated = true;
      state.admin = action.payload.user;
      state.token = action.payload.token;
      // Persist admin auth state to localStorage
      localStorage.setItem('adminAuthState', JSON.stringify({ 
        isAdminAuthenticated: true, 
        admin: action.payload.user, 
        token: action.payload.token 
      }));
    },
    clearAdminAuth: (state) => {
      state.isAdminAuthenticated = false;
      state.admin = null;
      state.token = null;
      // Clear admin auth state from localStorage
      localStorage.removeItem('adminAuthState');
    },
  },
});

export const { setAuth, clearAuth, setAdminAuth, clearAdminAuth } = authSlice.actions;

export default authSlice.reducer;
