
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isModalOpen: false,
  modalType: 'add', // 'add', 'edit', 'view'
  notificationData: null,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    openNotificationModal: (state, action) => {
      state.isModalOpen = true;
      state.modalType = action.payload.modalType;
      state.notificationData = action.payload.data || null;
    },
    closeNotificationModal: (state) => {
      state.isModalOpen = false;
      state.modalType = 'add';
      state.notificationData = null;
    },
  },
});

export const { openNotificationModal, closeNotificationModal } = notificationSlice.actions;

export default notificationSlice.reducer;
