import { createSlice } from "@reduxjs/toolkit";
import { batchImportTrendProducts } from "./homePageTrendProductsActions";

const homePageTrendProductsSlice = createSlice({
  name: "homePageTrendProducts",
  initialState: {
    trendProducts: [],  // Array of trend products
    loading: false,
    error: null,
    successMessage: null, // For success message after batch import
  },
  reducers: {
    // Optional: Clear the trend products state
    clearTrendProductsState: (state) => {
      state.trendProducts = [];
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(batchImportTrendProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(batchImportTrendProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.trendProducts = action.payload.products || [];
        state.successMessage = action.payload.message || "Trend products imported successfully!";
      })
      .addCase(batchImportTrendProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearTrendProductsState } = homePageTrendProductsSlice.actions;
export default homePageTrendProductsSlice.reducer;
