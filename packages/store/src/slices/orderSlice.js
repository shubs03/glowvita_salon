import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  orders: [],
  status: 'idle',
  error: null,
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setOrders(state, action) {
      state.orders = action.payload;
    },
    updateOrderStatus(state, action) {
      const { orderId, status } = action.payload;
      const order = state.orders.find(o => o._id === orderId);
      if (order) {
        order.status = status;
      }
    },
  },
});

export const { setOrders, updateOrderStatus } = orderSlice.actions;

export default orderSlice.reducer;
