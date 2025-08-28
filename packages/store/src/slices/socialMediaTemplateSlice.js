import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  templates: [],
  currentTemplate: {
    title: '',
    description: '',
    category: '',
    availableFor: 'admin',
    imageUrl: '',
  },
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  },
};

const socialMediaTemplateSlice = createSlice({
  name: 'socialMediaTemplates',
  initialState,
  reducers: {
    setTemplates: (state, action) => {
      // Format template IDs as SMT001, SMT002, etc.
      state.templates = action.payload.templates.map((template, index) => ({
        ...template,
        id: `SMT${String(index + 1).padStart(3, '0')}`
      }));
      state.pagination.totalItems = action.payload.total;
      state.status = 'succeeded';
    },
    setCurrentTemplate: (state, action) => {
      state.currentTemplate = action.payload;
    },
    addTemplate: (state, action) => {
      const newId = `SMT${String(state.templates.length + 1).padStart(3, '0')}`;
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
  resetTemplates 
} = socialMediaTemplateSlice.actions;

export const selectAllTemplates = (state) => state.socialMediaTemplates.templates;
export const selectCurrentTemplate = (state) => state.socialMediaTemplates.currentTemplate;
export const selectTemplateStatus = (state) => state.socialMediaTemplates.status;
export const selectTemplateError = (state) => state.socialMediaTemplates.error;
export const selectTemplatePagination = (state) => state.socialMediaTemplates.pagination;

export default socialMediaTemplateSlice.reducer;
