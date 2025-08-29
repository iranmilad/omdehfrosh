// src/store/category/slices/filterSettingsSlice.js

import { createSlice } from "@reduxjs/toolkit";
import { saveFilterSettings } from "./saveFilterSettingsActions";

const filterSettingsSlice = createSlice({
  name: "filterSettings",
  initialState: {
    saveStatus: null,
    saveLoading: false,
    saveError: null,
  },
  reducers: {
    clearSaveFilterState: (state) => {
      state.saveStatus = null;
      state.saveLoading = false;
      state.saveError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveFilterSettings.pending, (state) => {
        state.saveLoading = true;
        state.saveError = null;
      })
      .addCase(saveFilterSettings.fulfilled, (state, action) => {
        state.saveLoading = false;
        state.saveStatus = action.payload;
      })
      .addCase(saveFilterSettings.rejected, (state, action) => {
        state.saveLoading = false;
        state.saveError = action.payload;
      });
  },
});

export const { clearSaveFilterState } = filterSettingsSlice.actions;
export default filterSettingsSlice.reducer;
