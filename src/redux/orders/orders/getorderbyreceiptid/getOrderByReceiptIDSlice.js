import { createSlice } from "@reduxjs/toolkit";
import { getOrderByReceiptID } from "./getOrderByReceiptIDActions.js"; // Correct import



const getOrderByReceiptIDSlice = createSlice({
  name: "orderByReceiptID",
  initialState: {
    orderByReceiptID: null,
    loadingByReceiptID: false,
    errorByReceiptID: null,
  },
  reducers: {
    clearorderByReceiptIDState: (state) => {
      state.orderByReceiptID = null;
      state.errorByReceiptID = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getOrderByReceiptID.pending, (state) => {
        state.loadingByReceiptID = true;
        state.errorByReceiptID = null;
      })
      .addCase(getOrderByReceiptID.fulfilled, (state, action) => {
        state.loadingByReceiptID = false;
        state.orderByReceiptID = action.payload || null;
      })
      .addCase(getOrderByReceiptID.rejected, (state, action) => {
        state.loadingByReceiptID = false;
        state.errorByReceiptID = action.payload;
      });
  },
});

export const { clearOrderState } = getOrderByReceiptIDSlice.actions;
export default getOrderByReceiptIDSlice.reducer;
