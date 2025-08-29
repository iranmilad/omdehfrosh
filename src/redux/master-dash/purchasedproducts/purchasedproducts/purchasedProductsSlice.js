import { createSlice } from "@reduxjs/toolkit";
import { batchImportPurchasedProducts } from "./purchasedProductsActions";

// Slice for purchased products
const purchasedProductsSlice = createSlice({
  name: "purchasedProducts",
  initialState: {
    purchasedProducts: [], // Store the list of purchased products
    loading: false,
    error: null,
    successMessage: null, // For success message after batch import
  },
  reducers: {
    // Optional: Add more reducers if needed (e.g., clear error or success state)
    clearPurchasedProductsState: (state) => {
      state.purchasedProducts = [];
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(batchImportPurchasedProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(batchImportPurchasedProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.purchasedProducts = action.payload.purchasedProducts || [];
        state.successMessage = action.payload.message || "Purchased products imported successfully!";
      })
      .addCase(batchImportPurchasedProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export the clear action to reset state if needed
export const { clearPurchasedProductsState } = purchasedProductsSlice.actions;

export default purchasedProductsSlice.reducer;
