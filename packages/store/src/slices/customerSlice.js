
import { createSlice } from '@reduxjs/toolkit';

const customerOrdersData = [
  {
    id: 1,
    orderId: "ORD-001",
    customerId: "CUST-101",
    vendorName: "Glamour Salon",
    customerName: "Alice Johnson",
    orderType: "Online",
    appointmentDate: "2024-08-15",
    fees: 50,
    subTotal: 45,
    discount: 5,
    taxes: 8.1,
    couponApplied: "SUMMER10",
    paymentMode: "Credit Card",
    platformFees: 7.5,
    serviceTax: 0.6,
    orderStatus: "Completed",
  },
  {
    id: 2,
    orderId: "ORD-002",
    customerId: "CUST-102",
    vendorName: "Modern Cuts",
    customerName: "Bob Williams",
    orderType: "Offline",
    appointmentDate: "2024-08-16",
    fees: 30,
    subTotal: 30,
    discount: 0,
    taxes: 5.4,
    couponApplied: "N/A",
    paymentMode: "Cash",
    platformFees: 4.5,
    serviceTax: 0,
    orderStatus: "Confirmed",
  },
  {
    id: 3,
    orderId: "ORD-003",
    customerId: "CUST-103",
    vendorName: "Style Hub",
    customerName: "Charlie Brown",
    orderType: "Online",
    appointmentDate: "2024-08-17",
    fees: 75,
    subTotal: 70,
    discount: 5,
    taxes: 12.6,
    couponApplied: "NEW5",
    paymentMode: "PayPal",
    platformFees: 11.25,
    serviceTax: 1.35,
    orderStatus: "Pending",
  },
];

const initialState = {
  orders: customerOrdersData,
  filteredOrders: customerOrdersData,
  filters: {
    orderType: '',
    paymentMode: '',
    orderStatus: '',
    appointmentDate: '',
  },
  pagination: {
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: customerOrdersData.length,
    totalPages: Math.ceil(customerOrdersData.length / 10),
  },
};

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    setCustomerFilter(state, action) {
      const { filterName, value } = action.payload;
      state.filters[filterName] = value;
      // Add filtering logic here if needed, or handle in component
    },
    setCurrentCustomerPage(state, action) {
      state.pagination.currentPage = action.payload;
    },
    setCustomerItemsPerPage(state, action) {
      state.pagination.itemsPerPage = action.payload;
      state.pagination.currentPage = 1;
      state.pagination.totalPages = Math.ceil(state.filteredOrders.length / action.payload);
    },
    clearCustomerFilters(state) {
        state.filters = initialState.filters;
    }
  },
});

export const { 
    setCustomerFilter, 
    setCurrentCustomerPage, 
    setCustomerItemsPerPage,
    clearCustomerFilters
} = customerSlice.actions;

export default customerSlice.reducer;
