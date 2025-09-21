// src/redux/savefiltersettings/deleteFilterSettings/deleteFilterSettingsSlice.js

import { createSlice } from "@reduxjs/toolkit";
import { deleteFilterSettings } from "./deleteFilterSettingsActions.js";

const deleteFilterSettingsSlice = createSlice({
  name: "deleteFilterSettings",
  initialState: {
    deleteStatus: null,
    deleteLoading: false,
    deleteError: null,
    deleteLoadingId: null,
  },
  reducers: {
    clearDeleteFilterState: (state) => {
      state.deleteStatus = null;
      state.deleteLoading = false;
      state.deleteError = null;
      state.deleteLoadingId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(deleteFilterSettings.pending, (state, action) => {
        state.deleteLoading = true;
        state.deleteError = null;
        state.deleteLoadingId = action.meta?.arg?.id ?? null;
      })
      .addCase(deleteFilterSettings.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteStatus = action.payload;
        state.deleteLoadingId = null;
      })
      .addCase(deleteFilterSettings.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
        state.deleteLoadingId = null;
      });
  },
});

export const { clearDeleteFilterState } = deleteFilterSettingsSlice.actions;
export default deleteFilterSettingsSlice.reducer;