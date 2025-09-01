import { createSlice } from '@reduxjs/toolkit';
import { glowvitaApi } from '../services/api';

const initialState = {
  vendor: null,
  loading: false, 
  error: null,
  message: '',
};

const vendorSlice = createSlice({
  name: 'vendors',
  initialState,
  reducers: {
    setVendor(state, action) {
      state.vendor = action.payload;
    },
    clearVendorMessage(state) {
      state.message = '';
    },
    clearVendorError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Handle get vendor profile
    builder
      .addMatcher(
        glowvitaApi.endpoints.getVendorProfile.matchPending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        glowvitaApi.endpoints.getVendorProfile.matchFulfilled,
        (state, { payload }) => {
          state.loading = false;
          if (payload.success) {
            state.vendor = payload.data;
          } else {
            state.error = payload.message;
          }
        }
      )
      .addMatcher(
        glowvitaApi.endpoints.getVendorProfile.matchRejected,
        (state, { error }) => {
          state.loading = false;
          state.error = error.message || 'Failed to fetch vendor profile';
        }
      )
      // Handle update vendor profile
      .addMatcher(
        glowvitaApi.endpoints.updateVendorProfile.matchPending,
        (state) => {
          state.loading = true;
          state.error = null;
          state.message = '';
        }
      )
      .addMatcher(
        glowvitaApi.endpoints.updateVendorProfile.matchFulfilled,
        (state, { payload }) => {
          state.loading = false;
          if (payload.success) {
            state.vendor = payload.data;
            state.message = payload.message;
          } else {
            state.error = payload.message;
          }
        }
      )
      .addMatcher(
        glowvitaApi.endpoints.updateVendorProfile.matchRejected,
        (state, { error }) => {
          state.loading = false;
          state.error = error.message || 'Failed to update vendor profile';
        }
      );
  },
});

export const {
  setVendor,
  clearVendorMessage,
  clearVendorError
} = vendorSlice.actions;

// Selectors
export const selectVendor = (state) => state.vendors.vendor;
export const selectVendorLoading = (state) => state.vendors.loading;
export const selectVendorError = (state) => state.vendors.error;
export const selectVendorMessage = (state) => state.vendors.message;

export default vendorSlice.reducer;