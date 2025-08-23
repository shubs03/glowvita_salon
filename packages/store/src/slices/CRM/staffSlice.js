
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  staffList: [],
  loading: false,
  error: null,
};

const staffSlice = createSlice({
  name: 'staff',
  initialState,
  reducers: {
    setStaffList(state, action) {
      state.staffList = action.payload;
    },
    addStaff(state, action) {
      state.staffList.push(action.payload);
    },
    updateStaff(state, action) {
      const index = state.staffList.findIndex(s => s._id === action.payload._id);
      if (index !== -1) {
        state.staffList[index] = action.payload;
      }
    },
    deleteStaff(state, action) {
      state.staffList = state.staffList.filter(s => s._id !== action.payload);
    },
    setLoading(state, action) {
        state.loading = action.payload;
    },
    setError(state, action) {
        state.error = action.payload;
    }
  },
});

export const { 
    setStaffList, 
    addStaff, 
    updateStaff, 
    deleteStaff,
    setLoading,
    setError
} = staffSlice.actions;

export default staffSlice.reducer;
