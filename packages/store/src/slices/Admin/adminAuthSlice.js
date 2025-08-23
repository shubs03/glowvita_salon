
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAdminAuthenticated: false,
  admin: null,
  token: null,
};

// Function to safely load state from localStorage
const loadState = () => {
  try {
    // Check if localStorage is available
    if (typeof localStorage !== 'undefined') {
      const serializedState = localStorage.getItem('adminAuthState');
      if (serializedState === null) {
        return initialState;
      }
      const parsedState = JSON.parse(serializedState);
      // Basic validation of the stored state
      if (parsedState && typeof parsedState.isAdminAuthenticated === 'boolean') {
        return parsedState;
      }
    }
    return initialState;
  } catch (e) {
    console.error("Could not load auth state from localStorage", e);
    return initialState;
  }
};

const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState: loadState(),
  reducers: { 
    setAdminAuth: (state, action) => {
      const { user, token } = action.payload;
      state.isAdminAuthenticated = true;
      state.admin = user;
      state.token = token;

      // Persist state to localStorage only on the client-side
      if (typeof localStorage !== 'undefined') {
        try {
          const serializedState = JSON.stringify({
            isAdminAuthenticated: true,
            admin: user,
            token: token,
          });
          localStorage.setItem('adminAuthState', serializedState);
        } catch (e) {
          console.error("Could not save auth state to localStorage", e);
        }
      }
    },
    clearAdminAuth: (state) => {
      state.isAdminAuthenticated = false;
      state.admin = null;
      state.token = null;

      // Clear localStorage only on the client-side
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('adminAuthState');
      }
    },
  },
});

export const { setAdminAuth, clearAdminAuth } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;
