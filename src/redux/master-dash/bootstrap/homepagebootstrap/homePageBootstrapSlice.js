import { createSlice } from "@reduxjs/toolkit";
import { batchImportHomePageBootstrap } from "./homePageBootstrapActions";

const homePageBootstrapSlice = createSlice({
  name: "homePageBootstrap",
  initialState: {
    bootstrap: [],
    loading: false,
    error: null,
    successMessage: null, // For success message after batch import
  },
  reducers: {
    clearHomePageBootstrapState: (state) => {
      state.bootstrap = [];
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(batchImportHomePageBootstrap.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(batchImportHomePageBootstrap.fulfilled, (state, action) => {
        state.loading = false;
        state.bootstrap = action.payload.bootstrap || [];
        state.successMessage = action.payload.message || "Bootstrap imported successfully!";
      })
      .addCase(batchImportHomePageBootstrap.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearHomePageBootstrapState } = homePageBootstrapSlice.actions;
export default homePageBootstrapSlice.reducer;
