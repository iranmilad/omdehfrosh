import { createSlice } from "@reduxjs/toolkit";
import { batchImportHomePageProducts } from "./homePageProductsActions";

const homePageProductsSlice = createSlice({
  name: "homePageProducts",
  initialState: {
    products: [],
    loading: false,
    error: null,
    successMessage: null, // For success message after batch import
  },
  reducers: {
    // Optional: Add more reducers if needed (e.g., clear error or success state)
    clearHomePageProductsState: (state) => {
      state.products = [];
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(batchImportHomePageProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(batchImportHomePageProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products || [];
        state.successMessage = action.payload.message || "Products imported successfully!";
      })
      .addCase(batchImportHomePageProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearHomePageProductsState } = homePageProductsSlice.actions;
export default homePageProductsSlice.reducer;
