import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  suppliers: [
    {
      id: "SUP-001",
      firstName: "John",
      lastName: "Doe",
      shopName: "Global Beauty Supplies",
      businessRegistrationNo: "GSTIN123456789",
      supplierType: "Hair Care",
      status: "Approved",
      contact: "contact@gbs.com",
      products: 125,
      sales: 25430,
      email: "john@example.com",
      mobile: "9876543210",
      country: "India",
      state: "Maharashtra",
      city: "Mumbai",
      pincode: "400001",
      address: "123 Beauty Street"
    },
    {
      id: "SUP-002",
      firstName: "Jane",
      lastName: "Smith",
      shopName: "Organic Skincare Inc.",
      businessRegistrationNo: "GSTIN987654321",
      supplierType: "Skin Care",
      status: "Pending",
      contact: "sales@organicskin.com",
      products: 45,
      sales: 12810,
      email: "jane@example.com",
      mobile: "9876543211",
      country: "India",
      state: "Karnataka",
      city: "Bangalore",
      pincode: "560001",
      address: "456 Organic Lane"
    }
  ]
};

const supplierSlice = createSlice({
  name: 'suppliers',
  initialState,
  reducers: {
    addSupplier: (state, action) => {
      // Create a new supplier without the licenseFile
      const { licenseFile, ...supplierData } = action.payload;
      const newSupplier = {
        ...supplierData,
        id: `SUP-${String(state.suppliers.length + 1).padStart(3, '0')}`,
        status: "Pending",
        licenseFileName: licenseFile?.name || ''
      };
      state.suppliers.push(newSupplier);
    },
    updateSupplier: (state, action) => {
      const index = state.suppliers.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.suppliers[index] = { ...state.suppliers[index], ...action.payload };
      }
    },
    updateSupplierStatus: (state, action) => {
      const { id, status } = action.payload;
      const supplier = state.suppliers.find(s => s.id === id);
      if (supplier) {
        supplier.status = status;
      }
    }
  }
});

export const { addSupplier, updateSupplier, updateSupplierStatus } = supplierSlice.actions;
export const selectAllSuppliers = (state) => state.suppliers.suppliers;
export const selectSupplierById = (id) => (state) => 
  state.suppliers.suppliers.find(supplier => supplier.id === id);

export default supplierSlice.reducer;
