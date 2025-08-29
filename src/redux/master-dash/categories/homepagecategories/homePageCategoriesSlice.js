import { createSlice } from "@reduxjs/toolkit";
import { batchImportHomePageCategories } from "./homePageCategoriesActions";

const homePageCategoriesSlice = createSlice({
  name: "homePageCategories",
  initialState: {
    categories: [],
    loading: false,
    error: null,
    successMessage: null, // For success message after batch import
  },
  reducers: {
    // Clear state action
    clearHomePageCategoriesState: (state) => {
      state.categories = [];
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(batchImportHomePageCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(batchImportHomePageCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.categories || [];
        state.successMessage = action.payload.message || "Categories imported successfully!";
      })
      .addCase(batchImportHomePageCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearHomePageCategoriesState } = homePageCategoriesSlice.actions;
export default homePageCategoriesSlice.reducer;
