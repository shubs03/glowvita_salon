import { createSlice } from '@reduxjs/toolkit';
import { glowvitaApi } from '../../services/api.js';

const initialState = {
  c2cSettings: null,
  c2vSettings: null,
  v2vSettings: null,
  modal: {
    isOpen: false,
    modalType: null,
    settings: null,
  },
  pagination: {
    currentPage: 1,
    itemsPerPage: 5,
  },
  status: 'idle',
  error: null,
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
      state.modal.settings = JSON.parse(JSON.stringify(action.payload.settings));
    },
    closeModal: (state) => {
      state.modal.isOpen = false;
      state.modal.modalType = null;
      state.modal.settings = null;
    },
    updateModalSettings: (state, action) => {
      if (state.modal.settings) {
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
  extraReducers: (builder) => {
    builder
      .addMatcher(
        glowvitaApi.endpoints.getSettings.matchPending,
        (state) => {
          state.status = 'loading';
          state.error = null;
        }
      )
      .addMatcher(
        glowvitaApi.endpoints.getSettings.matchFulfilled,
        (state, action) => {
          const { referralType } = action.meta.arg.originalArgs;
          const settings = action.payload;
          if (referralType === 'C2C') state.c2cSettings = settings;
          if (referralType === 'C2V') state.c2vSettings = settings;
          if (referralType === 'V2V') state.v2vSettings = settings;
          state.status = 'succeeded';
        }
      )
      .addMatcher(
        glowvitaApi.endpoints.getSettings.matchRejected,
        (state, action) => {
          state.status = 'failed';
          // Store only a serializable error message
          state.error = action.error?.message || 'Failed to fetch settings';
        }
      );
  }
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
