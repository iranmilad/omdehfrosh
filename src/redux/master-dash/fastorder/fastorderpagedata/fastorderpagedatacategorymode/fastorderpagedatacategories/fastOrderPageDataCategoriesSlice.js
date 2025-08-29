import { createSlice } from "@reduxjs/toolkit";
import { batchImportFastOrderPageCategories } from "./fastOrderPageDataCategoriesActions";

const fastOrderPageCategoriesSlice = createSlice({
  name: "fastOrderPageCategories",
  initialState: {
    categories: [],
    loading: false,
    error: null,
    successMessage: null, // Stores success message after batch import
  },
  reducers: {
    clearFastOrderPageCategoriesState: (state) => {
      state.categories = [];
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(batchImportFastOrderPageCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(batchImportFastOrderPageCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.categories || [];
        state.successMessage = action.payload.message || "Categories imported successfully!";
      })
      .addCase(batchImportFastOrderPageCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearFastOrderPageCategoriesState } = fastOrderPageCategoriesSlice.actions;
export default fastOrderPageCategoriesSlice.reducer;
