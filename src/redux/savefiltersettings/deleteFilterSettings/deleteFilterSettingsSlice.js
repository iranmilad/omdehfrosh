// src/redux/savefiltersettings/getFilterSettings/getFilterSettingsSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { getFilterSettings } from "../getFilterSettings/getFilterSettingsActions";
import { deleteFilterSettings } from "./deleteFilterSettingsActions";

const getFilterSettingsSlice = createSlice({
  name: "getFilterSettings",
  initialState: {
    savedFilters: [],
    loading: false,
    error: null,
    deleteLoadingId: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Load list
      .addCase(getFilterSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFilterSettings.fulfilled, (state, action) => {
        state.loading = false;
        // Adjust to your payload shape
        state.savedFilters = Array.isArray(action.payload) 
          ? action.payload 
          : action.payload?.data || [];
      })
      .addCase(getFilterSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load filters";
      })

      // Delete
      .addCase(deleteFilterSettings.pending, (state, action) => {
        state.deleteLoadingId = action.meta?.arg?.id ?? null;
      })
      .addCase(deleteFilterSettings.fulfilled, (state, action) => {
        const id = action.payload?.id;
        if (id) {
          state.savedFilters = state.savedFilters.filter((f) => f._id !== id);
        }
        state.deleteLoadingId = null;
      })
      .addCase(deleteFilterSettings.rejected, (state) => {
        state.deleteLoadingId = null;
      });
  },
});

export default getFilterSettingsSlice.reducer;
