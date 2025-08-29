// cartUpdateSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { updateCart } from './cartUpdateActions';


const initialState = {
  cartUpdate: [],
  totalUpdate: 0,
  loadingUpdate: false,
  errorUpdate: null
};

const cartUpdateSlice = createSlice({
  name: 'cartUpdate',
  initialState,
  reducers: {
    clearCartUpdateState: (state) => {
      state.cartUpdate = [];
      state.totalUpdate = 0;
      state.loadingUpdate = false;
      state.errorUpdate = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateCart.pending, (state) => {
        state.loadingUpdate = true;
        state.errorUpdate = null;
      })
      .addCase(updateCart.fulfilled, (state, action) => {
        state.loadingUpdate = false;
        state.cartUpdate = action.payload.cart;
        state.totalUpdate = action.payload.totalUpdate;
      })
      .addCase(updateCart.rejected, (state, action) => {
        state.loadingUpdate = false;
        state.errorUpdate = action.payload || 'Something went wrong';
      });
  }
});

export const { clearCartUpdateState } = cartUpdateSlice.actions;
export default cartUpdateSlice.reducer;
