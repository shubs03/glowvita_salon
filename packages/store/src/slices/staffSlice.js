import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  staff: [],
  selectedStaff: null,
  loading: false,
  error: null,
};

const staffSlice = createSlice({
  name: "staff",
  initialState,
  reducers: {
    setStaff: (state, action) => {
      state.staff = action.payload;
    },
    setSelectedStaff: (state, action) => {
      state.selectedStaff = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setStaff, setSelectedStaff, setLoading, setError } = staffSlice.actions;
export default staffSlice.reducer;