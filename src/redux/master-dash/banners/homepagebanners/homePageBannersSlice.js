import { createSlice } from "@reduxjs/toolkit";
import { batchImportHomePageBanners } from "./homePageBannersActions";

const homePageBannersSlice = createSlice({
  name: "homePageBanners",
  initialState: {
    banners: [],
    loading: false,
    error: null,
    successMessage: null, // For success message after batch import
  },
  reducers: {
    clearHomePageBannersState: (state) => {
      state.banners = [];
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(batchImportHomePageBanners.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(batchImportHomePageBanners.fulfilled, (state, action) => {
        state.loading = false;
        state.banners = action.payload.banners || [];
        state.successMessage = action.payload.message || "Banners imported successfully!";
      })
      .addCase(batchImportHomePageBanners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearHomePageBannersState } = homePageBannersSlice.actions;
export default homePageBannersSlice.reducer;
