import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { glowvitaApi } from '../services/api';

export const fetchShippingConfig = createAsyncThunk(
  'shipping/fetchConfig',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      console.log('Fetching shipping config...');
      const response = await dispatch(glowvitaApi.endpoints.getShippingConfig.initiate());
      
      if (response.error) {
        console.error('Error in shipping config response:', response.error);
        return rejectWithValue({
          message: response.error.data?.message || 'Failed to fetch shipping config',
          status: response.error.status
        });
      }
      
      if (response.data) {
        // Handle both direct data and nested data structure
        const configData = response.data.data || response.data;
        if (configData) {
          return configData;
        }
      }
      
      return rejectWithValue({
        message: 'No valid shipping configuration data received',
        status: 404
      });
    } catch (error) {
      console.error('Exception in fetchShippingConfig:', error);
      return rejectWithValue({
        message: error.message || 'An unexpected error occurred',
        status: 500
      });
    }
  }
);

export const updateShippingConfig = createAsyncThunk(
  'shipping/updateConfig',
  async (config, { dispatch, rejectWithValue }) => {
    try {
      const response = await dispatch(
        glowvitaApi.endpoints.updateShippingConfig.initiate(config)
      );
      
      if (response.error) {
        console.error('Error in update shipping config response:', response.error);
        return rejectWithValue({
          message: response.error.data?.message || 'Failed to update shipping config',
          status: response.error.status
        });
      }
      
      if (response.data) {
        return response.data;
      }
      
      return rejectWithValue({
        message: 'No data received in update shipping config response',
        status: 404
      });
    } catch (error) {
      console.error('Exception in updateShippingConfig:', error);
      return rejectWithValue({
        message: error.message || 'An unexpected error occurred',
        status: 500
      });
    }
  }
);

const initialState = {
  shippingConfig: {
    chargeType: 'fixed',
    amount: 0,
    isEnabled: false,
  },
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const shippingSlice = createSlice({
  name: 'shipping',
  initialState,
  reducers: {
    // Sync actions can still be used for local state updates
    setShippingConfig: (state, action) => {
      state.shippingConfig = action.payload;
      state.status = 'succeeded';
      state.error = null;
    },
    toggleShipping: (state, action) => {
      state.shippingConfig.isEnabled = action.payload;
    },
    resetShippingState: () => initialState,
  },
  extraReducers: (builder) => {
    // Handle fetchShippingConfig
    builder.addCase(fetchShippingConfig.pending, (state) => {
      state.status = 'loading';
    });
    builder.addCase(fetchShippingConfig.fulfilled, (state, action) => {
      state.shippingConfig = action.payload;
      state.status = 'succeeded';
      state.error = null;
    });
    builder.addCase(fetchShippingConfig.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload;
    });

    // Handle updateShippingConfig
    builder.addCase(updateShippingConfig.pending, (state) => {
      state.status = 'loading';
    });
    builder.addCase(updateShippingConfig.fulfilled, (state, action) => {
      state.shippingConfig = action.payload;
      state.status = 'succeeded';
      state.error = null;
    });
    builder.addCase(updateShippingConfig.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload;
    });
  },
});

export const {
  setShippingConfig,
  toggleShipping,
  resetShippingState,
} = shippingSlice.actions;

export const selectShippingConfig = (state) => state.shipping.shippingConfig;
export const selectIsShippingEnabled = (state) => state.shipping.shippingConfig.isEnabled;
export const selectShippingStatus = (state) => state.shipping.status;
export const selectShippingError = (state) => state.shipping.error;

export default shippingSlice.reducer;