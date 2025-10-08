import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  searchTerm: '',
  isModalOpen: false,
  isDeleteModalOpen: false,
  selectedService: null,
  modalType: 'add',
};

// Clear any old problematic localStorage data
const clearOldState = () => {
  try {
    localStorage.removeItem('serviceState');
  } catch (e) {
    // Ignore errors
  }
};

// Load only search term from localStorage to persist user's search
const loadState = () => {
  // Clear old problematic state first
  clearOldState();
  
  try {
    const serializedState = localStorage.getItem('serviceSearchState');
    if (serializedState === null) {
      return initialState;
    }
    const persistedState = JSON.parse(serializedState);
    // Only restore searchTerm, reset modal states
    return {
      ...initialState,
      searchTerm: persistedState.searchTerm || '',
    };
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
      // Only persist search term, not the entire state
      try {
        localStorage.setItem('serviceSearchState', JSON.stringify({ searchTerm: state.searchTerm }));
      } catch (e) {
        // Ignore localStorage errors
        console.warn('Failed to save search term to localStorage:', e);
      }
    },
    setModalOpen: (state, action) => {
      state.isModalOpen = action.payload.isOpen;
      state.modalType = action.payload.modalType || state.modalType;
      state.selectedService = action.payload.selectedService || null;
      // Don't persist modal state to localStorage
    },
    setDeleteModalOpen: (state, action) => {
      state.isDeleteModalOpen = action.payload.isOpen;
      state.selectedService = action.payload.selectedService || null;
      // Don't persist modal state to localStorage
    },
    clearServiceState: (state) => {
      state.searchTerm = '';
      state.isModalOpen = false;
      state.isDeleteModalOpen = false;
      state.selectedService = null;
      state.modalType = 'add';
      try {
        localStorage.removeItem('serviceSearchState');
      } catch (e) {
        // Ignore localStorage errors
        console.warn('Failed to clear search state from localStorage:', e);
      }
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