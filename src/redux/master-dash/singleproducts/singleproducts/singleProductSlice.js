import { createSlice } from "@reduxjs/toolkit";
import { batchImportSingleProducts } from "./singleProductActions";

const singleProductSlice = createSlice({
  name: "singleProducts",
  initialState: {
    products: [],
    loading: false,
    error: null,
    successMessage: null, // For success message after batch import
  },
  reducers: {
    // Optional: Reset state for single products
    clearSingleProductState: (state) => {
      state.products = [];
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(batchImportSingleProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(batchImportSingleProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products || [];
        state.successMessage = action.payload.message || "Single products imported successfully!";
      })
      .addCase(batchImportSingleProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSingleProductState } = singleProductSlice.actions;
export default singleProductSlice.reducer;
