import { createSlice } from '@reduxjs/toolkit';
import { glowvitaApi } from '../services/api';

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

// Extend the API with SMS Template endpoints
const extendedApiSlice = glowvitaApi.injectEndpoints({
  endpoints: (builder) => ({
    // CRM SMS Templates
    getCrmSmsTemplates: builder.query({
      query: () => ({
        url: '/crm/sms-template',
        method: 'GET'
      }),
      providesTags: ['CrmSmsTemplate'],
      transformResponse: (response) => {
        console.log('SMS Template Slice - Raw API response:', response);
        // Transform the response to match the expected format
        const result = {
          templates: response.success ? response.data : [],
          total: response.success ? response.data.length : 0
        };
        console.log('SMS Template Slice - Transformed response:', result);
        return result;
      }
    }),
    // Test endpoint without auth
    getTestSmsTemplates: builder.query({
      query: () => ({
        url: '/crm/test-sms-templates',
        method: 'GET'
      }),
      providesTags: ['TestSmsTemplate'],
      transformResponse: (response) => {
        console.log('Test SMS Template Slice - Raw API response:', response);
        const result = {
          templates: response.success ? response.data : [],
          total: response.success ? response.data.length : 0
        };
        console.log('Test SMS Template Slice - Transformed response:', result);
        return result;
      }
    }),
    getCrmSmsTemplateById: builder.query({
      query: (id) => `/crm/sms-template/${id}`,
      providesTags: (result, error, id) => [{ type: 'CrmSmsTemplate', id }]
    }),
    createCrmSmsTemplate: builder.mutation({
      query: (templateData) => ({
        url: '/crm/sms-template',
        method: 'POST',
        body: templateData
      }),
      invalidatesTags: ['CrmSmsTemplate']
    }),
    updateCrmSmsTemplate: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `/crm/sms-template/${id}`,
        method: 'PUT',
        body: updates
      }),
      invalidatesTags: (result, error, { id }) => [
        'CrmSmsTemplate',
        { type: 'CrmSmsTemplate', id }
      ]
    }),
    deleteCrmSmsTemplate: builder.mutation({
      query: (id) => ({
        url: `/crm/sms-template/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['CrmSmsTemplate']
    })
  })
});

// Export the auto-generated hooks
export const {
  useGetCrmSmsTemplatesQuery,
  useGetTestSmsTemplatesQuery,
  useGetCrmSmsTemplateByIdQuery,
  useCreateCrmSmsTemplateMutation,
  useUpdateCrmSmsTemplateMutation,
  useDeleteCrmSmsTemplateMutation
} = extendedApiSlice;
