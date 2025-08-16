import { createSlice } from '@reduxjs/toolkit';

const initialVendors = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    salonName: 'Glamour Salon',
    businessName: 'Glamour Salon',
    email: 'john.doe@example.com',
    phone: '1234567890',
    state: 'California',
    city: 'Los Angeles',
    pincode: '90001',
    address: '123 Glamour St',
    category: 'Hair Salon',
    subCategories: ['Haircut', 'Coloring'],
    serviceCategories: ['Styling'],
    profileImage: '',
    status: 'Active',
    subscription: {
      plan: 'basic',
      startDate: '2023-01-01',
      endDate: '2024-01-01',
      status: 'active',
    },
    gallery: [],
    bankDetails: {
      accountHolderName: 'John Doe',
      accountNumber: '123456789012',
      bankName: 'Example Bank',
      ifscCode: 'EXAM0001234',
    },
    documents: [],
    clients: [],
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    salonName: 'Beauty Spot',
    businessName: 'Beauty Spot',
    email: 'jane.smith@example.com',
    phone: '0987654321',
    state: 'New York',
    city: 'New York City',
    pincode: '10001',
    address: '456 Beauty Ave',
    category: 'Nail Salon',
    subCategories: ['Manicure', 'Pedicure'],
    serviceCategories: ['Nail Art'],
    profileImage: '',
    status: 'Disabled',
  },
];

const initialState = {
  vendors: initialVendors,
  loading: false, 
  error: null,
  message: '',
};

const vendorSlice = createSlice({
  name: 'vendors',
  initialState,
  reducers: {
    addVendor(state, action) {
      const newVendor = { ...action.payload, id: new Date().toISOString() };
      state.vendors.push(newVendor);
      state.message = 'Vendor added successfully!';
    },
    updateVendor(state, action) {
      const index = state.vendors.findIndex(v => v.id === action.payload.id);
      if (index !== -1) {
        state.vendors[index] = action.payload;
        state.message = 'Vendor updated successfully!';
      }
    },
    clearVendorMessage(state) {
      state.message = '';
    },
  },
});

export const {
  addVendor,
  updateVendor,
  clearVendorMessage
} = vendorSlice.actions;

// Selectors
export const selectAllVendors = (state) => state.vendors.vendors;
export const selectVendorById = (state, vendorId) =>
  state.vendors.vendors.find(vendor => vendor.id === vendorId);
export const selectVendorLoading = (state) => state.vendors.loading;
export const selectVendorError = (state) => state.vendors.error;
export const selectVendorMessage = (state) => state.vendors.message;

export default vendorSlice.reducer;