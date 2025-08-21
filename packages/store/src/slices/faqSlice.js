import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { glowvitaApi } from '../services/api';

// Async thunks (unchanged)
export const fetchFaqs = createAsyncThunk('faqs/fetchFaqs', async (_, { dispatch }) => {
  const response = await dispatch(glowvitaApi.endpoints.getFaqs.initiate());
  if (response.error) throw response.error;
  return response.data;
});

export const addNewFaq = createAsyncThunk('faqs/addNewFaq', 
  async (faqData, { dispatch }) => {
    const response = await dispatch(glowvitaApi.endpoints.createFaq.initiate(faqData));
    if (response.error) throw response.error;
    return response.data;
  }
);

export const updateFaqItem = createAsyncThunk('faqs/updateFaq',
  async ({ id, ...updates }, { dispatch }) => {
    const response = await dispatch(glowvitaApi.endpoints.updateFaq.initiate({ id, ...updates }));
    if (response.error) throw response.error;
    return response.data;
  }
);

export const deleteFaqItem = createAsyncThunk('faqs/deleteFaq',
  async (id, { dispatch }) => {
    const response = await dispatch(glowvitaApi.endpoints.deleteFaq.initiate(id));
    if (response.error) throw response.error;
    return id;
  }
);

const initialState = {
  faqs: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null
};

const faqSlice = createSlice({
  name: 'faqs',
  initialState,
  reducers: {
    // Add resetError reducer
    resetError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch FAQs
      .addCase(fetchFaqs.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchFaqs.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.faqs = action.payload || [];
      })
      .addCase(fetchFaqs.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      // Add new FAQ
      .addCase(addNewFaq.fulfilled, (state, action) => {
        state.faqs.unshift(action.payload);
      })
      // Update FAQ
      .addCase(updateFaqItem.fulfilled, (state, action) => {
        const index = state.faqs.findIndex(faq => faq._id === action.payload._id);
        if (index !== -1) {
          state.faqs[index] = action.payload;
        }
      })
      // Delete FAQ
      .addCase(deleteFaqItem.fulfilled, (state, action) => {
        state.faqs = state.faqs.filter(faq => faq._id !== action.payload);
      });
  }
});

// Export the resetError action
export const { resetError } = faqSlice.actions;

// Selectors (unchanged)
export const selectAllFaqs = (state) => state.faqs.faqs;
export const selectFaqById = (state, faqId) => 
  state.faqs.faqs.find(faq => faq._id === faqId);
export const selectFaqsStatus = (state) => state.faqs.status;
export const selectFaqsError = (state) => state.faqs.error;

export default faqSlice.reducer;