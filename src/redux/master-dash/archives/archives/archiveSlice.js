import { createSlice } from "@reduxjs/toolkit";
import { batchImportArchives } from "./archiveActions";

const archiveSlice = createSlice({
  name: "archives",
  initialState: {
    archives: [],
    loading: false,
    error: null,
    successMessage: null, // For success message after batch import
  },
  reducers: {
    // Optional: Clear the archive state
    clearArchiveState: (state) => {
      state.archives = [];
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(batchImportArchives.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(batchImportArchives.fulfilled, (state, action) => {
        state.loading = false;
        state.archives = action.payload.archives || [];
        state.successMessage = action.payload.message || "Archives imported successfully!";
      })
      .addCase(batchImportArchives.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearArchiveState } = archiveSlice.actions;
export default archiveSlice.reducer;
