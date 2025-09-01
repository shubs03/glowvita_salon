import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  clientList: [],
  loading: false,
  error: null,
};

const clientSlice = createSlice({
  name: 'client',
  initialState,
  reducers: {
    setClientList(state, action) {
      state.clientList = action.payload;
    },
    addClient(state, action) {
      state.clientList.push(action.payload);
    },
    updateClient(state, action) {
      const index = state.clientList.findIndex(c => c._id === action.payload._id);
      if (index !== -1) {
        state.clientList[index] = action.payload;
      }
    },
    deleteClient(state, action) {
      state.clientList = state.clientList.filter(c => c._id !== action.payload);
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
  setClientList, 
  addClient, 
  updateClient, 
  deleteClient,
  setLoading,
  setError
} = clientSlice.actions;

export default clientSlice.reducer;