import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  products: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  selectedProduct: null,
  filters: {
    search: '',
    category: '',
    status: 'all'
  }
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action) => {
      state.products = action.payload;
      state.status = 'succeeded';
    },
    addProduct: (state, action) => {
      state.products.push(action.payload);
    },
    updateProduct: (state, action) => {
      const index = state.products.findIndex(p => p._id === action.payload._id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
    },
    deleteProduct: (state, action) => {
      state.products = state.products.filter(p => p._id !== action.payload);
    },
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },
    setProductsLoading: (state) => {
      state.status = 'loading';
    },
    setProductsError: (state, action) => {
      state.status = 'failed';
      state.error = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        search: '',
        category: '',
        status: 'all'
      };
    }
  }
});

export const { 
  setProducts, 
  addProduct, 
  updateProduct, 
  deleteProduct, 
  setSelectedProduct,
  setProductsLoading,
  setProductsError,
  setFilters,
  clearFilters
} = productSlice.actions;

// Selectors
export const selectAllProducts = (state) => state.products.products;
export const selectProductById = (state, productId) => 
  state.products.products.find(p => p._id === productId);
export const selectProductsStatus = (state) => state.products.status;
export const selectProductsError = (state) => state.products.error;
export const selectSelectedProduct = (state) => state.products.selectedProduct;
export const selectProductFilters = (state) => state.products.filters;

// Filtered products selector
export const selectFilteredProducts = (state) => {
  const products = state.products.products;
  const filters = state.products.filters;
  
  return products.filter(product => {
    const matchesSearch = !filters.search || 
      product.productName.toLowerCase().includes(filters.search.toLowerCase()) ||
      product.description?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesCategory = !filters.category || 
      product.category?.name === filters.category;
    
    const matchesStatus = filters.status === 'all' || 
      product.status === filters.status;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
};

export default productSlice.reducer;
