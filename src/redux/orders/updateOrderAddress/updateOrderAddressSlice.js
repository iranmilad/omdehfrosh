// src/redux/orders/updateOrderAddress/updateOrderAddressSlice.js

import { createSlice } from "@reduxjs/toolkit";
import { updateOrderAddress } from "./updateOrderAddressActions";

const updateOrderAddressSlice = createSlice({
  name: "updateOrderAddress",
  initialState: {
    updateStatus: null,
    updateLoading: false,
    updateError: null,
  },
  reducers: {
    clearUpdateAddressState: (state) => {
      state.updateStatus = null;
      state.updateLoading = false;
      state.updateError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateOrderAddress.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateOrderAddress.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateStatus = action.payload;
      })
      .addCase(updateOrderAddress.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      });
  },
});

export const { clearUpdateAddressState } = updateOrderAddressSlice.actions;
export default updateOrderAddressSlice.reducer;