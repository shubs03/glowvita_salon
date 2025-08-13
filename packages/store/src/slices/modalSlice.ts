
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ModalType = 
    'addVendor' | 'editVendor' | 'viewVendor' |
    'addCoupon' | 'editCoupon' | 'viewCoupon' |
    'addRole'   | 'editRole'   |
    'confirmation';

interface ModalState {
  isOpen: boolean;
  modalType: ModalType | null;
  data: any | null;
}

const initialState: ModalState = {
  isOpen: false,
  modalType: null,
  data: null,
};

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    openModal: (state, action: PayloadAction<{ modalType: ModalType; data?: any }>) => {
      state.isOpen = true;
      state.modalType = action.payload.modalType;
      state.data = action.payload.data || null;
    },
    closeModal: (state) => {
      state.isOpen = false;
      state.modalType = null;
      state.data = null;
    },
  },
});

export const { openModal, closeModal } = modalSlice.actions;
export default modalSlice.reducer;
