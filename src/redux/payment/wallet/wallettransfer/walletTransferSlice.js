import { createSlice } from "@reduxjs/toolkit";
import { transferFromWallet } from "./walletTransferActions";

const walletTransferSlice = createSlice({
  name: "walletTransfer",
  initialState: {
    transferResult: null,
    loadingTransfer: false,
    errorTransfer: null,
  },
  reducers: {
    clearTransferState: (state) => {
      state.transferResult = null;
      state.errorTransfer = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(transferFromWallet.pending, (state) => {
        state.loadingTransfer = true;
        state.errorTransfer = null;
      })
      .addCase(transferFromWallet.fulfilled, (state, action) => {
        state.loadingTransfer = false;
        state.transferResult = action.payload;
      })
      .addCase(transferFromWallet.rejected, (state, action) => {
        state.loadingTransfer = false;
        state.errorTransfer = action.payload;
      });
  },
});

export const { clearTransferState } = walletTransferSlice.actions;
export default walletTransferSlice.reducer;
