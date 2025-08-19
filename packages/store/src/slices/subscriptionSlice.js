import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { glowvitaApi } from '../services/api';

const initialState = {
  plans: [],
  loading: false,
  error: null,
};

// Async thunks (retained for compatibility, but simplified)
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
  async ({ _id, ...updates }, { dispatch }) => { // Changed id to _id
    try {
      const result = await dispatch(
        glowvitaApi.endpoints.updateSubscriptionPlan.initiate({ _id, ...updates })
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
  async (_id, { dispatch }) => { // Changed id to _id
    try {
      const result = await dispatch(glowvitaApi.endpoints.deleteSubscriptionPlan.initiate(_id));
      if (result.error) throw result.error;
      return _id;
    } catch (error) {
      throw error;
    }
  }
);

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

    // Create plan (no manual state update; rely on getSubscriptionPlans refetch)
    builder.addCase(createNewPlan.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(createNewPlan.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });

    // Update plan (no manual state update; rely on getSubscriptionPlans refetch)
    builder.addCase(updateExistingPlan.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(updateExistingPlan.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });

    // Delete plan
    builder.addCase(removePlan.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(removePlan.fulfilled, (state, action) => {
      state.loading = false;
      // Remove the deleted plan from the state
      state.plans = state.plans.filter(plan => plan._id !== action.payload);
    });
    builder.addCase(removePlan.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
  },
});

// Selectors
export const selectAllPlans = (state) => state.subscription.plans;
export const selectPlanById = (state, planId) =>
  state.subscription.plans.find((plan) => plan._id === planId); // Changed id to _id
export const selectLoading = (state) => state.subscription.loading;
export const selectError = (state) => state.subscription.error;

export default subscriptionSlice.reducer;