import { createSlice } from "@reduxjs/toolkit";
import { requestFinalReceipt } from "./cartFinalReceiptRequestReceiptActions";

const cartFinalReceiptRequestSlice = createSlice({
  name: "cartFinalReceiptRequest",
  initialState: {
    vatRequestStatus: null,
    loadingVatRequest: false,
    errorVatRequest: null,
  },
  reducers: {
    clearVatRequestStatus: (state) => {
      state.vatRequestStatus = null;
      state.errorVatRequest = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(requestFinalReceipt.pending, (state) => {
        state.loadingVatRequest = true;
        state.errorVatRequest = null;
      })
      .addCase(requestFinalReceipt.fulfilled, (state, action) => {
        state.loadingVatRequest = false;
        state.vatRequestStatus = action.payload;
      })
      .addCase(requestFinalReceipt.rejected, (state, action) => {
        state.loadingVatRequest = false;
        state.errorVatRequest = action.payload;
      });
  },
});

export const { clearVatRequestStatus } = cartFinalReceiptRequestSlice.actions;
export default cartFinalReceiptRequestSlice.reducer;
