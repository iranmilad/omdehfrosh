// src/store/category/slices/updateFilterSettingsSlice.js

import { createSlice } from "@reduxjs/toolkit";
import { updateFilterSettings } from "./updateFilterSettingsActions";

const updateFilterSettingsSlice = createSlice({
  name: "updateFilterSettings",
  initialState: {
    updateStatus: null,
    updateLoading: false,
    updateError: null,
  },
  reducers: {
    clearUpdateFilterState: (state) => {
      state.updateStatus = null;
      state.updateLoading = false;
      state.updateError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateFilterSettings.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateFilterSettings.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateStatus = action.payload;
      })
      .addCase(updateFilterSettings.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      });
  },
});

export const { clearUpdateFilterState } = updateFilterSettingsSlice.actions;
export default updateFilterSettingsSlice.reducer;
