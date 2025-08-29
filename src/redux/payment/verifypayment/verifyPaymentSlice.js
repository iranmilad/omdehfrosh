import { createSlice } from "@reduxjs/toolkit";
import { verifyPayment } from "./verifyPaymentActions.js";

const verifyPaymentSlice = createSlice({
  name: "verifypayment",
  initialState: {
    paymentStatus: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearVerifyPaymentState: (state) => {
      state.paymentStatus = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentStatus = action.payload || null;
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearVerifyPaymentState } = verifyPaymentSlice.actions;
export default verifyPaymentSlice.reducer;
