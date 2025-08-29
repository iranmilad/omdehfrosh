import { createSlice } from "@reduxjs/toolkit";
import { verifyPaymentWallet } from "./verifyPaymentWalletActions.js";

const verifyPaymentWalletSlice = createSlice({
  name: "verifyPaymentWallet",
  initialState: {
    walletPaymentStatus: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearVerifyPaymentWalletState: (state) => {
      state.walletPaymentStatus = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyPaymentWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyPaymentWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.walletPaymentStatus = action.payload || null;
      })
      .addCase(verifyPaymentWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearVerifyPaymentWalletState } = verifyPaymentWalletSlice.actions;
export default verifyPaymentWalletSlice.reducer;
