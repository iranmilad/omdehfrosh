import { createSlice } from "@reduxjs/toolkit";
import { batchImportHomePageWideSliders } from "./homepagewideslidersActions";

const homePageWideSlidersSlice = createSlice({
  name: "homePageWideSliders",
  initialState: {
    wideSliders: [],
    loading: false,
    error: null,
    successMessage: null, // For success message after batch import
  },
  reducers: {
    // Optional: Add more reducers if needed (e.g., clear error or success state)
    clearHomePageWideSlidersState: (state) => {
      state.wideSliders = [];
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(batchImportHomePageWideSliders.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(batchImportHomePageWideSliders.fulfilled, (state, action) => {
        state.loading = false;
        state.wideSliders = action.payload.wideSliders || [];
        state.successMessage = action.payload.message || "WideSliders imported successfully!";
      })
      .addCase(batchImportHomePageWideSliders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearHomePageWideSlidersState } = homePageWideSlidersSlice.actions;
export default homePageWideSlidersSlice.reducer;
