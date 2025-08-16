import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  taxes: [],
  fees: [],
  loading: false,
  error: null,
  filters: {
    search: '',
    status: 'all',
    type: 'all',
  },
  pagination: {
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 1,
  },
  sort: {
    field: 'createdAt',
    order: 'desc',
  },
};

const taxFeesSlice = createSlice({
  name: 'taxFees',
  initialState,
  reducers: {
    // Tax actions
    setTaxes(state, action) {
      state.taxes = action.payload;
      state.pagination.totalItems = action.payload.length;
      state.pagination.totalPages = Math.ceil(
        action.payload.length / state.pagination.itemsPerPage
      );
    },
    addTax(state, action) {
      state.taxes.unshift(action.payload);
      state.pagination.totalItems += 1;
      state.pagination.totalPages = Math.ceil(
        state.pagination.totalItems / state.pagination.itemsPerPage
      );
    },
    updateTax(state, action) {
      const index = state.taxes.findIndex(tax => tax.id === action.payload.id);
      if (index !== -1) {
        state.taxes[index] = { ...state.taxes[index], ...action.payload };
      }
    },
    removeTax(state, action) {
      state.taxes = state.taxes.filter(tax => tax.id !== action.payload);
      state.pagination.totalItems -= 1;
      state.pagination.totalPages = Math.ceil(
        (state.pagination.totalItems - 1) / state.pagination.itemsPerPage
      );
    },

    // Fee actions
    setFees(state, action) {
      state.fees = action.payload;
    },
    addFee(state, action) {
      state.fees.unshift(action.payload);
    },
    updateFee(state, action) {
      const index = state.fees.findIndex(fee => fee.id === action.payload.id);
      if (index !== -1) {
        state.fees[index] = { ...state.fees[index], ...action.payload };
      }
    },
    removeFee(state, action) {
      state.fees = state.fees.filter(fee => fee.id !== action.payload);
    },

    // Common actions
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    setTaxFeesFilter(state, action) {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.currentPage = 1;
    },
    setCurrentTaxFeesPage(state, action) {
      state.pagination.currentPage = action.payload;
    },
    setTaxFeesItemsPerPage(state, action) {
      state.pagination.itemsPerPage = action.payload;
      state.pagination.currentPage = 1;
      state.pagination.totalPages = Math.ceil(
        state.pagination.totalItems / action.payload
      );
    },
    clearTaxFeesFilters(state) {
      state.filters = initialState.filters;
    },
    setSort(state, action) {
      state.sort = { ...state.sort, ...action.payload };
    },
  },
});

export const {
  setTaxes,
  addTax,
  updateTax,
  removeTax,
  setFees,
  addFee,
  updateFee,
  removeFee,
  setLoading,
  setError,
  setTaxFeesFilter,
  setCurrentTaxFeesPage,
  setTaxFeesItemsPerPage,
  clearTaxFeesFilters,
  setSort,
} = taxFeesSlice.actions;

export default taxFeesSlice.reducer;
