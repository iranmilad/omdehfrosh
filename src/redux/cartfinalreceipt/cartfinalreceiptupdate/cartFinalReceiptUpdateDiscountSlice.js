import { createSlice } from "@reduxjs/toolkit";
import { updateFinalReceiptWithDiscount } from "./cartFinalReceiptUpdateDiscountActions";

const cartFinalReceiptUpdateSlice = createSlice({
  name: "cartFinalReceiptUpdate",
  initialState: {
    cartfinalreceiptDiscount: [],
    totalfinalreceiptDiscount: 0,
    loadingUpdateDiscount: false,
    errorUpdateDiscount: null,
  },
  reducers: {
    clearCartFinalReceiptUpdate: (state) => {
      state.cartfinalreceiptDiscount = [];
      state.totalfinalreceiptDiscount = 0;
      state.errorUpdateDiscount = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handling discount code application
      .addCase(updateFinalReceiptWithDiscount.pending, (state) => {
        state.loadingUpdateDiscount = true;
        state.errorUpdateDiscount = null;
      })
      .addCase(updateFinalReceiptWithDiscount.fulfilled, (state, action) => {
        state.loadingUpdateDiscount = false;
        state.cartfinalreceiptDiscount = action.payload || [];
        state.totalfinalreceiptDiscount = action.payload.totalPriceApply || 0;
        
      })
      .addCase(updateFinalReceiptWithDiscount.rejected, (state, action) => {
        state.loadingUpdateDiscount = false;
        state.errorUpdateDiscount = action.payload;
        state.message = action.payload.message
      })
      

  },
});

export const { clearCartFinalReceiptUpdate } = cartFinalReceiptUpdateSlice.actions;
export default cartFinalReceiptUpdateSlice.reducer;
