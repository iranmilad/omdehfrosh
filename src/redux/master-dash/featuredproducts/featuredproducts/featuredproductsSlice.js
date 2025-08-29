import { createSlice } from "@reduxjs/toolkit";
import { batchImportHomePageFeaturedProducts } from "./featuredproductsActions";

const homePageFeaturedProductsSlice = createSlice({
  name: "homePageFeaturedProducts",
  initialState: {
    featuredProducts: [],
    loading: false,
    error: null,
    successMessage: null, // For success message after batch import
  },
  reducers: {
    // Optional: Add more reducers if needed (e.g., clear error or success state)
    clearHomePageFeaturedProductsState: (state) => {
      state.featuredProducts = [];
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(batchImportHomePageFeaturedProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(batchImportHomePageFeaturedProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.featuredProducts = action.payload.featuredProducts || [];
        state.successMessage = action.payload.message || "FeaturedProducts imported successfully!";
      })
      .addCase(batchImportHomePageFeaturedProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearHomePageFeaturedProductsState } = homePageFeaturedProductsSlice.actions;
export default homePageFeaturedProductsSlice.reducer;
