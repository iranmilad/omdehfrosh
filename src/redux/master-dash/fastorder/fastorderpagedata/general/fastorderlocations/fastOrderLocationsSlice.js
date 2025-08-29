import { createSlice } from "@reduxjs/toolkit";
import { batchImportFastOrderLocations } from "./fastOrderLocationsActions";

const fastOrderLocationsSlice = createSlice({
  name: "fastOrderLocations",
  initialState: {
    locations: [],
    loading: false,
    error: null,
    successMessage: null, // Stores success message after batch import
  },
  reducers: {
    clearFastOrderLocationsState: (state) => {
      state.locations = [];
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(batchImportFastOrderLocations.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(batchImportFastOrderLocations.fulfilled, (state, action) => {
        state.loading = false;
        state.locations = action.payload.locations || [];
        state.successMessage = action.payload.message || "Locations imported successfully!";
      })
      .addCase(batchImportFastOrderLocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearFastOrderLocationsState } = fastOrderLocationsSlice.actions;
export default fastOrderLocationsSlice.reducer;
