import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  workingHours: {},
  loading: false,
  error: null,
};

const workingHoursSlice = createSlice({
  name: 'workingHours',
  initialState,
  reducers: {
    setWorkingHours(state, action) {
      state.workingHours = action.payload;
    },
    updateWorkingHours(state, action) {
      state.workingHours = {
        ...state.workingHours,
        ...action.payload
      };
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    resetWorkingHours(state) {
      state.workingHours = {};
      state.loading = false;
      state.error = null;
    }
  },
});

export const { 
  setWorkingHours, 
  updateWorkingHours, 
  setLoading, 
  setError, 
  resetWorkingHours 
} = workingHoursSlice.actions;

export default workingHoursSlice.reducer;