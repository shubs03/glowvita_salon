import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { glowvitaApi } from '../services/api';

// Async thunks using the API endpoints directly
export const fetchSubscriptionPlans = createAsyncThunk(
  'subscription/fetchPlans',
  async (_, { dispatch }) => {
    try {
      const result = await dispatch(glowvitaApi.endpoints.getSubscriptionPlans.initiate());
      if (result.error) throw result.error;
      return result.data;
    } catch (error) {
      throw error;
    }
  }
);

export const createNewPlan = createAsyncThunk(
  'subscription/createPlan',
  async (planData, { dispatch }) => {
    try {
      const result = await dispatch(glowvitaApi.endpoints.createSubscriptionPlan.initiate(planData));
      if (result.error) throw result.error;
      return result.data;
    } catch (error) {
      throw error;
    }
  }
);

export const updateExistingPlan = createAsyncThunk(
  'subscription/updatePlan',
  async ({ id, ...updates }, { dispatch }) => {
    try {
      const result = await dispatch(
        glowvitaApi.endpoints.updateSubscriptionPlan.initiate({ id, ...updates })
      );
      if (result.error) throw result.error;
      return result.data;
    } catch (error) {
      throw error;
    }
  }
);

export const removePlan = createAsyncThunk(
  'subscription/deletePlan',
  async (id, { dispatch }) => {
    try {
      const result = await dispatch(glowvitaApi.endpoints.deleteSubscriptionPlan.initiate(id));
      if (result.error) throw result.error;
      return id;
    } catch (error) {
      throw error;
    }
  }
);

const initialState = {
  plans: [],
  loading: false,
  error: null
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch plans
    builder.addCase(fetchSubscriptionPlans.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchSubscriptionPlans.fulfilled, (state, action) => {
      state.loading = false;
      state.plans = action.payload || [];
    });
    builder.addCase(fetchSubscriptionPlans.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });

    // Create plan
    builder.addCase(createNewPlan.fulfilled, (state, action) => {
      if (action.payload) {
        state.plans.push(action.payload);
      }
    });

    // Update plan
    builder.addCase(updateExistingPlan.fulfilled, (state, action) => {
      if (action.payload) {
        const index = state.plans.findIndex(plan => plan.id === action.payload.id);
        if (index !== -1) {
          state.plans[index] = action.payload;
        }
      }
    });

    // Delete plan
    builder.addCase(removePlan.fulfilled, (state, action) => {
      state.plans = state.plans.filter(plan => plan.id !== action.payload);
    });
  }
});

// Selectors
export const selectAllPlans = (state) => state.subscription.plans;
export const selectPlanById = (state, planId) => 
  state.subscription.plans.find(plan => plan.id === planId);
export const selectLoading = (state) => state.subscription.loading;
export const selectError = (state) => state.subscription.error;

export default subscriptionSlice.reducer;
