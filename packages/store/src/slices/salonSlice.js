
import { createSlice } from '@reduxjs/toolkit';

const salonListData = [
    {
        id: 1,
        salonName: "Glamour Salon",
        vendorContact: "vendor1@example.com",
        vendorOwner: "Ms. Glamour",
        adminReservation: 100,
        adminPay: 85,
        settlementAmount: 15,
    },
    {
        id: 2,
        salonName: "Modern Cuts",
        vendorContact: "vendor2@example.com",
        vendorOwner: "Mr. Modern",
        adminReservation: 150,
        adminPay: 127.5,
        settlementAmount: 22.5,
    },
    {
        id: 3,
        salonName: "Style Hub",
        vendorContact: "vendor3@example.com",
        vendorOwner: "Mx. Style",
        adminReservation: 200,
        adminPay: 170,
        settlementAmount: 30,
    }
];

const initialState = {
  salons: salonListData,
  filteredSalons: salonListData,
  filters: {
    salonName: '',
    vendorOwner: '',
  },
  pagination: {
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: salonListData.length,
    totalPages: Math.ceil(salonListData.length / 10),
  },
};

const salonSlice = createSlice({
  name: 'salon',
  initialState,
  reducers: {
    setSalonFilter(state, action) {
      const { filterName, value } = action.payload;
      state.filters[filterName] = value;
      // Add filtering logic here if needed, or handle in component
    },
    setCurrentSalonPage(state, action) {
      state.pagination.currentPage = action.payload;
    },
    setSalonItemsPerPage(state, action) {
      state.pagination.itemsPerPage = action.payload;
      state.pagination.currentPage = 1;
      state.pagination.totalPages = Math.ceil(state.filteredSalons.length / action.payload);
    },
    clearSalonFilters(state) {
        state.filters = initialState.filters;
    }
  },
});

export const { 
    setSalonFilter, 
    setCurrentSalonPage, 
    setSalonItemsPerPage,
    clearSalonFilters
} = salonSlice.actions;

export default salonSlice.reducer;
