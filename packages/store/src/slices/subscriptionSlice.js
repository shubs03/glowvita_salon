import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  plans: [
    {
      id: 'PLAN-001',
      name: 'Basic Monthly',
      duration: 1,
      durationType: 'months',
      price: 99900, // in paise (₹999.00)
      status: 'Active',
      features: ['Basic feature 1', 'Basic feature 2']
    },
    {
      id: 'PLAN-002',
      name: 'Premium Monthly',
      duration: 1,
      durationType: 'months',
      price: 199900, // in paise (₹1,999.00)
      status: 'Active',
      features: ['Premium feature 1', 'Premium feature 2', '24/7 Support']
    },
    {
      id: 'PLAN-003',
      name: 'Basic Yearly',
      duration: 12,
      durationType: 'months',
      price: 999900, // in paise (₹9,999.00)
      status: 'Inactive',
      features: ['Yearly feature 1', 'Yearly feature 2', '2 months free']
    }
  ]
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    addPlan: (state, action) => {
      const newPlan = {
        ...action.payload,
        id: `PLAN-${String(state.plans.length + 1).padStart(3, '0')}`,
        status: 'Active',
        features: action.payload.features || []
      };
      state.plans.push(newPlan);
    },
    updatePlan: (state, action) => {
      const index = state.plans.findIndex(plan => plan.id === action.payload.id);
      if (index !== -1) {
        state.plans[index] = { ...state.plans[index], ...action.payload };
      }
    },
    deletePlan: (state, action) => {
      state.plans = state.plans.filter(plan => plan.id !== action.payload);
    },
    togglePlanStatus: (state, action) => {
      const plan = state.plans.find(plan => plan.id === action.payload);
      if (plan) {
        plan.status = plan.status === 'Active' ? 'Inactive' : 'Active';
      }
    }
  }
});

// Actions
export const { addPlan, updatePlan, deletePlan, togglePlanStatus } = subscriptionSlice.actions;

// Selectors
export const selectAllPlans = (state) => state.subscription.plans;
export const selectPlanById = (state, planId) => 
  state.subscription.plans.find(plan => plan.id === planId);

export default subscriptionSlice.reducer;
