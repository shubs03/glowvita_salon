
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isModalOpen: false,
  isViewModalOpen: false,
  isDeleteModalOpen: false,
  selectedFence: null,
  isEditMode: false,
};

const geoFencingSlice = createSlice({
  name: 'geoFencing',
  initialState,
  reducers: {
    openFenceModal(state, action) {
      state.isModalOpen = true;
      state.selectedFence = action.payload.fence;
      state.isEditMode = action.payload.isEditMode;
    },
    closeFenceModal(state) {
      state.isModalOpen = false;
      state.selectedFence = null;
      state.isEditMode = false;
    },
    openViewFenceModal(state, action) {
      state.isViewModalOpen = true;
      state.selectedFence = action.payload;
    },
    closeViewFenceModal(state) {
      state.isViewModalOpen = false;
      state.selectedFence = null;
    },
    openDeleteFenceModal(state, action) {
      state.isDeleteModalOpen = true;
      state.selectedFence = action.payload;
    },
    closeDeleteFenceModal(state) {
      state.isDeleteModalOpen = false;
      state.selectedFence = null;
    },
  },
});

export const {
  openFenceModal,
  closeFenceModal,
  openViewFenceModal,
  closeViewFenceModal,
  openDeleteFenceModal,
  closeDeleteFenceModal,
} = geoFencingSlice.actions;

export default geoFencingSlice.reducer;
