import { createSlice } from "@reduxjs/toolkit";
import { withdrawFromWallet } from "./walletWithDrawalActions.js";

const walletWithDrawalSlice = createSlice({
  name: "walletWithDrawal",
  initialState: {
    withdrawResult: null,
    loadingWithdraw: false,
    errorWithdraw: null,
  },
  reducers: {
    clearWithdrawState: (state) => {
      state.withdrawResult = null;
      state.errorWithdraw = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(withdrawFromWallet.pending, (state) => {
        state.loadingWithdraw = true;
        state.errorWithdraw = null;
      })
      .addCase(withdrawFromWallet.fulfilled, (state, action) => {
        state.loadingWithdraw = false;
        state.withdrawResult = action.payload;
      })
      .addCase(withdrawFromWallet.rejected, (state, action) => {
        state.loadingWithdraw = false;
        state.errorWithdraw = action.payload;
      });
  },
});

export const { clearWithdrawState } = walletWithDrawalSlice.actions;
export default walletWithDrawalSlice.reducer;
