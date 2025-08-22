import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  searchTerm: '',
  isModalOpen: false,
  isDeleteModalOpen: false,
  selectedService: null,
  modalType: 'add',
};

// Load state from localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('serviceState');
    if (serializedState === null) {
      return initialState;
    }
    return JSON.parse(serializedState);
  } catch (e) {
    return initialState;
  }
};

const serviceSlice = createSlice({
  name: 'service',
  initialState: loadState(),
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      localStorage.setItem('serviceState', JSON.stringify(state));
    },
    setModalOpen: (state, action) => {
      state.isModalOpen = action.payload.isOpen;
      state.modalType = action.payload.modalType || state.modalType;
      state.selectedService = action.payload.selectedService || null;
      localStorage.setItem('serviceState', JSON.stringify(state));
    },
    setDeleteModalOpen: (state, action) => {
      state.isDeleteModalOpen = action.payload.isOpen;
      state.selectedService = action.payload.selectedService || null;
      localStorage.setItem('serviceState', JSON.stringify(state));
    },
    clearServiceState: (state) => {
      state.searchTerm = '';
      state.isModalOpen = false;
      state.isDeleteModalOpen = false;
      state.selectedService = null;
      state.modalType = 'add';
      localStorage.removeItem('serviceState');
    },
  },
});

export const {
  setSearchTerm,
  setModalOpen,
  setDeleteModalOpen,
  clearServiceState,
} = serviceSlice.actions;

export default serviceSlice.reducer; 