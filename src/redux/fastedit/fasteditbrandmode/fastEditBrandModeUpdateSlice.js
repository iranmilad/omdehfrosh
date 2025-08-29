import { createSlice } from "@reduxjs/toolkit";
import { updateFastEditBrandMode } from "./fastEditBrandModeUpdateActions";





const fastEditBrandModeUpdateSlice = createSlice({
  name: "fastEditBrandModeUpdate",
  initialState: {
    brandModeUpdate: null,
    loadingBrandModeUpdate: false,
    errorBrandModeUpdate: null,
    successMessageBrandModeUpdate: null, // For success message after update
  },
  reducers: {
    // Optional: Add more reducers if needed (e.g., clear state)
    clearFastEditBrandModeState: (state) => {
      state.brandModeUpdate = null;
      state.loadingBrandModeUpdate = false;
      state.errorBrandModeUpdate = null;
      state.successMessageBrandModeUpdate = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateFastEditBrandMode.pending, (state) => {
        state.loadingBrandModeUpdate = true;
        state.errorBrandModeUpdate = null;
        state.successMessageBrandModeUpdate = null;
      })
      .addCase(updateFastEditBrandMode.fulfilled, (state, action) => {
        state.loadingBrandModeUpdate = false;
        state.brandModeUpdate = action.payload || null;
        state.successMessageBrandModeUpdate = action.payload.message || "Brand mode updated successfully!";
      })
      .addCase(updateFastEditBrandMode.rejected, (state, action) => {
        state.loadingBrandModeUpdate = false;
        state.errorBrandModeUpdate = action.payload;
      });
  },
});

export const { clearFastEditBrandModeState } = fastEditBrandModeUpdateSlice.actions;
export default fastEditBrandModeUpdateSlice.reducer;
