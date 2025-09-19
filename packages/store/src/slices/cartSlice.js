
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [], // { _id, productName, price, quantity, productImage, vendorId, supplierName }
  isOpen: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action) {
      const newItem = action.payload;
      const existingItem = state.items.find(item => item._id === newItem._id);

      if (existingItem) {
        existingItem.quantity += newItem.quantity || 1;
      } else {
        state.items.push({ ...newItem, quantity: newItem.quantity || 1 });
      }
    },
    updateQuantity(state, action) {
      const { _id, quantity } = action.payload;
      const item = state.items.find(item => item._id === _id);
      if (item) {
        item.quantity = Math.max(1, quantity);
      }
    },
    removeFromCart(state, action) {
      const idToRemove = action.payload;
      state.items = state.items.filter(item => item._id !== idToRemove);
    },
    clearCart(state) {
      state.items = [];
    },
    setCartOpen(state, action) {
      state.isOpen = action.payload;
    },
  },
});

export const { 
    addToCart, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    setCartOpen
} = cartSlice.actions;

export default cartSlice.reducer;
