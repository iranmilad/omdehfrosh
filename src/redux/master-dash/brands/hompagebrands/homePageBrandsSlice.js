import { createSlice } from "@reduxjs/toolkit";
import { batchImportHomePageBrands } from "./homePageBrandsActions";

const homePageBrandsSlice = createSlice({
  name: "homePageBrands",
  initialState: {
    brands: [],
    loading: false,
    error: null,
    successMessage: null, // For success message after batch import
  },
  reducers: {
    // Optional: Add more reducers if needed (e.g., clear error or success state)
    clearHomePageBrandsState: (state) => {
      state.brands = [];
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(batchImportHomePageBrands.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(batchImportHomePageBrands.fulfilled, (state, action) => {
        state.loading = false;
        state.brands = action.payload.brands || [];
        state.successMessage = action.payload.message || "Brands imported successfully!";
      })
      .addCase(batchImportHomePageBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearHomePageBrandsState } = homePageBrandsSlice.actions;
export default homePageBrandsSlice.reducer;
