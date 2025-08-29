import { createSlice } from "@reduxjs/toolkit";
import { saveFilterSettings } from "../saveFilterSettingsActions";
import { getFilterSettings } from "./getFilterSettingsActions";

const filterSettingsSlice = createSlice({
  name: "filterSettings",
  initialState: {
    saveStatus: null,
    saveLoading: false,
    saveError: null,

    getStatus: null,
    getLoading: false,
    getError: null,
    savedFilters: [],      // renamed from filters to savedFilters
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
      // Save
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
      })

      // Get
      .addCase(getFilterSettings.pending, (state) => {
        state.getLoading = true;
        state.getError = null;
      })
      .addCase(getFilterSettings.fulfilled, (state, action) => {
        state.getLoading = false;
        state.savedFilters = action.payload;   // updated here
        state.getStatus = "success";
      })
      .addCase(getFilterSettings.rejected, (state, action) => {
        state.getLoading = false;
        state.getError = action.payload;
        state.getStatus = "failed";
      });
  },
});

export const { clearSaveFilterState } = filterSettingsSlice.actions;
export default filterSettingsSlice.reducer;
