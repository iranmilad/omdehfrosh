import { createSlice } from "@reduxjs/toolkit";
import { batchImportMenu } from "./menuActions";

const menuSlice = createSlice({
  name: "menu",
  initialState: {
    menu: null,
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    // Optional: Add more reducers if needed (e.g., clear error or success state)
    clearMenuState: (state) => {
      state.menu = null;
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(batchImportMenu.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(batchImportMenu.fulfilled, (state, action) => {
        state.loading = false;
        state.menu = action.payload.menu || null;
        state.successMessage = action.payload.message || "Menu imported successfully!";
      })
      .addCase(batchImportMenu.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMenuState } = menuSlice.actions;
export default menuSlice.reducer;
