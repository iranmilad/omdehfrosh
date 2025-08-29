import { createSlice } from "@reduxjs/toolkit";
import { getPaymentLink } from "./getPaymentLinkActions.js";


const getPaymentLinkSlice = createSlice({
  name: "getpaymentlink",
  initialState: {
    paymentLink: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearPaymentLinkState: (state) => {
      state.paymentLink = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPaymentLink.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentLink.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentLink = action.payload || null;
      })
      .addCase(getPaymentLink.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPaymentLinkState } = getPaymentLinkSlice.actions;
export default getPaymentLinkSlice.reducer;
