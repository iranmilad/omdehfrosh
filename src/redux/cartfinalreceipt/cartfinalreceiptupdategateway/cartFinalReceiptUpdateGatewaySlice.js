import { createSlice } from "@reduxjs/toolkit";
import { updateFinalReceiptPaymentMethod } from "./cartFinalReceiptUpdateGatewayActions";

const cartFinalReceiptUpdateGatewaySlice = createSlice({
  name: "cartFinalReceiptUpdateGateway",
  initialState: {
    paymentMethod: null, // Store the updated payment method
    loading: false,
    error: null,
  },
  reducers: {
    clearPaymentMethodUpdate: (state) => {
      state.paymentMethod = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateFinalReceiptPaymentMethod.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFinalReceiptPaymentMethod.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentMethod = action.payload.paymentMethod || null; // Store only payment method
      })
      .addCase(updateFinalReceiptPaymentMethod.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPaymentMethodUpdate } = cartFinalReceiptUpdateGatewaySlice.actions;
export default cartFinalReceiptUpdateGatewaySlice.reducer;
