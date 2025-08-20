import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAdminAuthenticated: false,
  admin: null,
  token: null,
};

// Load state from localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('adminAuthState');
    if (serializedState === null) {
      return initialState;
    }
    return JSON.parse(serializedState);
  } catch (e) {
    return initialState;
  }
};

const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState: loadState(),
  reducers: { 
    setAdminAuth: (state, action) => {
      state.isAdminAuthenticated = true;
      state.admin = action.payload.user;
      state.token = action.payload.token;

      // Persist state
      localStorage.setItem(
        'adminAuthState',
        JSON.stringify({
          isAdminAuthenticated: true,
          admin: action.payload.user,
          token: action.payload.token,
        })
      );
    },
    clearAdminAuth: (state) => {
      state.isAdminAuthenticated = false;
      state.admin = null;
      state.token = null;

      // Clear localStorage
      localStorage.removeItem('adminAuthState');
    },
  },
});

export const { setAdminAuth, clearAdminAuth } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;
