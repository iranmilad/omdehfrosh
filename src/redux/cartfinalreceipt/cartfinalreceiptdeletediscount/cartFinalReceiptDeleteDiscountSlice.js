import { createSlice } from "@reduxjs/toolkit";
import { updateFinalReceiptDeleteDiscountCode } from "./cartFinalReceiptDeleteDiscountActions";


const cartFinalReceiptUpdateDeleteSlice = createSlice({
  name: "cartFinalReceiptUpdateDelete",
  initialState: {
    cartfinalreceiptDiscountDelete: [],
    totalfinalreceiptDiscountDelete: 0,
    loadingUpdateDiscountDelete: false,
    errorUpdateDiscountDelete: null,
  },
  reducers: {
    clearCartFinalReceiptUpdateDelete: (state) => {
      state.cartfinalreceiptDiscountDelete = [];
      state.totalfinalreceiptDiscountDelete = 0;
      state.errorUpdateDiscountDelete = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handling discount code removal
      .addCase(updateFinalReceiptDeleteDiscountCode.pending, (state) => {
        state.loadingUpdateDiscountDelete = true;
        state.errorUpdateDiscountDelete = null;
      })
      .addCase(updateFinalReceiptDeleteDiscountCode.fulfilled, (state, action) => {
        state.loadingUpdateDiscountDelete = false;
        state.cartfinalreceiptDiscountDelete = action.payload || [];
        state.totalfinalreceiptDiscountDelete = action.payload.totalPriceApply || 0;
      })
      .addCase(updateFinalReceiptDeleteDiscountCode.rejected, (state, action) => {
        state.loadingUpdateDiscountDelete = false;
        state.errorUpdateDiscountDelete = action.payload;
      });
  },
});

export const { clearCartFinalReceiptUpdateDelete } = cartFinalReceiptUpdateDeleteSlice.actions;
export default cartFinalReceiptUpdateDeleteSlice.reducer;
