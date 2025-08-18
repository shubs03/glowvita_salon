import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  suppliers: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null
};

const supplierSlice = createSlice({
  name: 'suppliers',
  initialState,
  reducers: {
    setSuppliers: (state, action) => {
      state.suppliers = action.payload;
    },
    addSupplier: (state, action) => {
      state.suppliers.push(action.payload);
    },
    updateSupplier: (state, action) => {
      const index = state.suppliers.findIndex(s => s._id === action.payload._id);
      if (index !== -1) {
        state.suppliers[index] = action.payload;
      }
    },
    deleteSupplier: (state, action) => {
      state.suppliers = state.suppliers.filter(s => s._id !== action.payload);
    }
  }
});

export const { setSuppliers, addSupplier, updateSupplier, deleteSupplier } = supplierSlice.actions;

export const selectAllSuppliers = (state) => state.suppliers.suppliers;
export const selectSupplierById = (state, supplierId) => state.suppliers.suppliers.find(s => s._id === supplierId);

export default supplierSlice.reducer;
