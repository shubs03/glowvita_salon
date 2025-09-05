import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Modal states
  isCreateCampaignModalOpen: false,
  isEditCampaignModalOpen: false,
  isViewCampaignModalOpen: false,
  isDeleteCampaignModalOpen: false,
  isSmsTemplateModalOpen: false,
  isSocialPostModalOpen: false,
  
  // Selected items
  selectedCampaign: null,
  selectedSmsTemplate: null,
  selectedSocialPost: null,
  
  // Edit mode
  isEditMode: false,
  
  // Loading states
  loading: false,
  error: null,
  message: '',
};

const marketingSlice = createSlice({
  name: 'marketing',
  initialState,
  reducers: {
    // Campaign Modal Management
    openCreateCampaignModal(state) {
      state.isCreateCampaignModalOpen = true;
      state.selectedCampaign = null;
      state.isEditMode = false;
    },
    closeCreateCampaignModal(state) {
      state.isCreateCampaignModalOpen = false;
      state.selectedCampaign = null;
      state.isEditMode = false;
    },
    openEditCampaignModal(state, action) {
      state.isEditCampaignModalOpen = true;
      state.selectedCampaign = action.payload;
      state.isEditMode = true;
    },
    closeEditCampaignModal(state) {
      state.isEditCampaignModalOpen = false;
      state.selectedCampaign = null;
      state.isEditMode = false;
    },
    openViewCampaignModal(state, action) {
      state.isViewCampaignModalOpen = true;
      state.selectedCampaign = action.payload;
    },
    closeViewCampaignModal(state) {
      state.isViewCampaignModalOpen = false;
      state.selectedCampaign = null;
    },
    openDeleteCampaignModal(state, action) {
      state.isDeleteCampaignModalOpen = true;
      state.selectedCampaign = action.payload;
    },
    closeDeleteCampaignModal(state) {
      state.isDeleteCampaignModalOpen = false;
      state.selectedCampaign = null;
    },

    // SMS Template Modal Management
    openSmsTemplateModal(state, action) {
      state.isSmsTemplateModalOpen = true;
      state.selectedSmsTemplate = action.payload?.template || null;
      state.isEditMode = action.payload?.isEditMode || false;
    },
    closeSmsTemplateModal(state) {
      state.isSmsTemplateModalOpen = false;
      state.selectedSmsTemplate = null;
      state.isEditMode = false;
    },

    // Social Post Modal Management
    openSocialPostModal(state, action) {
      state.isSocialPostModalOpen = true;
      state.selectedSocialPost = action.payload?.post || null;
      state.isEditMode = action.payload?.isEditMode || false;
    },
    closeSocialPostModal(state) {
      state.isSocialPostModalOpen = false;
      state.selectedSocialPost = null;
      state.isEditMode = false;
    },

    // Loading and Error Management
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
    clearError(state) {
      state.error = null;
    },
    setMessage(state, action) {
      state.message = action.payload;
    },
    clearMessage(state) {
      state.message = '';
    },
  },
});

export const {
  openCreateCampaignModal,
  closeCreateCampaignModal,
  openEditCampaignModal,
  closeEditCampaignModal,
  openViewCampaignModal,
  closeViewCampaignModal,
  openDeleteCampaignModal,
  closeDeleteCampaignModal,
  openSmsTemplateModal,
  closeSmsTemplateModal,
  openSocialPostModal,
  closeSocialPostModal,
  setLoading,
  setError,
  clearError,
  setMessage,
  clearMessage,
} = marketingSlice.actions;

export default marketingSlice.reducer;