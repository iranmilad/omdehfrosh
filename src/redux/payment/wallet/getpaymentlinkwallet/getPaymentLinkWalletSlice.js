import { createSlice } from "@reduxjs/toolkit";
import { getPaymentLinkWallet } from "./getPaymentLinkWalletActions.js";

const getPaymentLinkWalletSlice = createSlice({
  name: "getPaymentLinkWallet",
  initialState: {
    walletPaymentLink: null,
    loadingWalletPaymentLink: false,
    errorWalletPaymentLink: null,
  },
  reducers: {
    clearPaymentLinkWalletState: (state) => {
      state.walletPaymentLink = null;
      state.errorWalletPaymentLink = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPaymentLinkWallet.pending, (state) => {
        state.loadingWalletPaymentLink = true;
        state.errorWalletPaymentLink = null;
      })
      .addCase(getPaymentLinkWallet.fulfilled, (state, action) => {
        state.loadingWalletPaymentLink = false;
        state.walletPaymentLink = action.payload || null;
      })
      .addCase(getPaymentLinkWallet.rejected, (state, action) => {
        state.loadingWalletPaymentLink = false;
        state.errorWalletPaymentLink = action.payload;
      });
  },
});

export const { clearPaymentLinkWalletState } = getPaymentLinkWalletSlice.actions;
export default getPaymentLinkWalletSlice.reducer;
