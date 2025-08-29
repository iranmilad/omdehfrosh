import { createSlice } from "@reduxjs/toolkit";
import { batchImportFastOrderBrandModeFilters } from "./fastOrderPageDataBrandModeFiltersActions";

const fastOrderBrandModeFiltersSlice = createSlice({
  name: "fastOrderBrandModeFilters",
  initialState: {
    filters: [],
    loading: false,
    error: null,
    successMessage: null, // Stores success message after batch import
  },
  reducers: {
    clearFastOrderBrandModeFiltersState: (state) => {
      state.filters = [];
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(batchImportFastOrderBrandModeFilters.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(batchImportFastOrderBrandModeFilters.fulfilled, (state, action) => {
        state.loading = false;
        state.filters = action.payload.filters || [];
        state.successMessage = action.payload.message || "Filters imported successfully!";
      })
      .addCase(batchImportFastOrderBrandModeFilters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearFastOrderBrandModeFiltersState } = fastOrderBrandModeFiltersSlice.actions;
export default fastOrderBrandModeFiltersSlice.reducer;
