import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  templates: [],
  currentTemplate: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  },
};

const smsTemplateSlice = createSlice({
  name: 'smsTemplates',
  initialState,
  reducers: {
    setTemplates: (state, action) => {
      // Format template IDs as TMP001, TMP002, etc.
      state.templates = action.payload.templates.map((template, index) => ({
        ...template,
        id: `TMP${String(index + 1).padStart(3, '0')}`
      }));
      state.pagination.totalItems = action.payload.total;
      state.status = 'succeeded';
    },
    setCurrentTemplate: (state, action) => {
      state.currentTemplate = action.payload;
    },
    addTemplate: (state, action) => {
      const newId = `TMP${String(state.templates.length + 1).padStart(3, '0')}`;
      state.templates.push({
        ...action.payload,
        id: newId
      });
    },
    updateTemplate: (state, action) => {
      const index = state.templates.findIndex(t => t._id === action.payload._id);
      if (index !== -1) {
        state.templates[index] = action.payload;
      }
    },
    deleteTemplate: (state, action) => {
      state.templates = state.templates.filter(t => t._id !== action.payload);
    },
    setPagination: (state, action) => {
      state.pagination = {
        ...state.pagination,
        ...action.payload,
      };
    },
    setLoading: (state, action) => {
      state.status = action.payload ? 'loading' : 'idle';
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.status = 'failed';
    },
    resetTemplates: (state) => {
      state.templates = [];
      state.currentTemplate = null;
      state.status = 'idle';
      state.error = null;
      state.pagination = {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
      };
    },
  },
});

export const {
  setTemplates,
  setCurrentTemplate,
  addTemplate,
  updateTemplate,
  deleteTemplate,
  setPagination,
  setLoading,
  setError,
  resetTemplates,
} = smsTemplateSlice.actions;

// Selectors
export const selectTemplates = (state) => state.smsTemplates.templates;
export const selectCurrentTemplate = (state) => state.smsTemplates.currentTemplate;
export const selectIsLoading = (state) => state.smsTemplates.status === 'loading';
export const selectError = (state) => state.smsTemplates.error;
export const selectPagination = (state) => state.smsTemplates.pagination;

export default smsTemplateSlice.reducer;
