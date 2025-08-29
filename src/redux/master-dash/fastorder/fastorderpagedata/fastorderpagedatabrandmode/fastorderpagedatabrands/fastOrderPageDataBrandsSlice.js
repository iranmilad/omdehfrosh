import { createSlice } from "@reduxjs/toolkit";
import { batchImportFastOrderPageBrands } from "./fastOrderPageDataBrandsActions";

const fastOrderPageBrandsSlice = createSlice({
  name: "fastOrderPageBrands",
  initialState: {
    brands: [],
    loading: false,
    error: null,
    successMessage: null, // Stores success message after batch import
  },
  reducers: {
    clearFastOrderPageBrandsState: (state) => {
      state.brands = [];
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(batchImportFastOrderPageBrands.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(batchImportFastOrderPageBrands.fulfilled, (state, action) => {
        state.loading = false;
        state.brands = action.payload.brands || [];
        state.successMessage = action.payload.message || "Brands imported successfully!";
      })
      .addCase(batchImportFastOrderPageBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearFastOrderPageBrandsState } = fastOrderPageBrandsSlice.actions;
export default fastOrderPageBrandsSlice.reducer;
