import { createSlice } from "@reduxjs/toolkit";
import { batchImportCategoryFilters } from "./addBatchCategoryFiltersActions";

const categoryFiltersSlice = createSlice({
  name: "categoryFilters",
  initialState: {
    filters: [],
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearCategoryFiltersState: (state) => {
      state.filters = [];
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(batchImportCategoryFilters.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(batchImportCategoryFilters.fulfilled, (state, action) => {
        state.loading = false;
        state.filters = action.payload.categoryFilters || [];
        state.successMessage = action.payload.message || "Category filters imported successfully!";
      })
      .addCase(batchImportCategoryFilters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCategoryFiltersState } = categoryFiltersSlice.actions;
export default categoryFiltersSlice.reducer;
