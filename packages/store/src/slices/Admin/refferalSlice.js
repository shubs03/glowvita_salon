import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  c2cSettings: {
    referrerBonus: {
      bonusType: 'amount',
      bonusValue: 50,
      creditTime: '48 hours',
    },
    usageLimit: 'unlimited',
    usageCount: null,
    refereeBonus: {
      enabled: false,
      bonusType: 'discount',
      bonusValue: 10,
      creditTime: '24 hours',
    },
    minOrders: 1,
  },
  c2vSettings: {
    referrerBonus: {
      bonusType: 'amount',
      bonusValue: 500,
      creditTime: '15 days',
    },
    usageLimit: 'manual',
    usageCount: 100,
    refereeBonus: {
      enabled: false,
      bonusType: 'amount',
      bonusValue: 200,
      creditTime: '15 days',
    },
    minBookings: 5,
  },
  v2vSettings: {
    referrerBonus: {
      bonusType: 'amount',
      bonusValue: 1000,
      creditTime: '30 days',
    },
    usageLimit: 'unlimited',
    usageCount: null,
    refereeBonus: {
      enabled: false,
      bonusType: 'amount',
      bonusValue: 500,
      creditTime: '30 days',
    },
    minPayoutCycle: 1,
  },
  modal: {
    isOpen: false,
    modalType: null,
    settings: null,
  },
  pagination: {
    currentPage: 1,
    itemsPerPage: 5,
  },
};

const referralSlice = createSlice({
  name: 'referral',
  initialState,
  reducers: {
    setC2CSettings: (state, action) => {
      state.c2cSettings = action.payload;
    },
    setC2VSettings: (state, action) => {
      state.c2vSettings = action.payload;
    },
    setV2VSettings: (state, action) => {
      state.v2vSettings = action.payload;
    },
    openModal: (state, action) => {
      state.modal.isOpen = true;
      state.modal.modalType = action.payload.type;
      // Create a deep copy of settings to avoid mutation issues
      state.modal.settings = JSON.parse(JSON.stringify(action.payload.settings));
    },
    closeModal: (state) => {
      state.modal.isOpen = false;
      state.modal.modalType = null;
      state.modal.settings = null;
    },
    updateModalSettings: (state, action) => {
      if (state.modal.settings) {
        // Deep merge the changes into the existing settings
        state.modal.settings = {
          ...state.modal.settings,
          ...action.payload,
        };
      }
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
  },
});

export const {
  setC2CSettings,
  setC2VSettings,
  setV2VSettings,
  openModal,
  closeModal,
  updateModalSettings,
  setPagination,
} = referralSlice.actions;

export default referralSlice.reducer;
