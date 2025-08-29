import { createSlice } from "@reduxjs/toolkit";
import { batchImportGateways } from "./gateWaysActions";

// Slice for gateways
const gatewaysSlice = createSlice({
  name: "gateways",
  initialState: {
    gateways: [], // Store the list of gateways
    loading: false,
    error: null,
    successMessage: null, // For success message after batch import
  },
  reducers: {
    // Optional: Add more reducers if needed (e.g., clear error or success state)
    clearGatewaysState: (state) => {
      state.gateways = [];
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(batchImportGateways.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(batchImportGateways.fulfilled, (state, action) => {
        state.loading = false;
        state.gateways = action.payload.gateways || [];
        state.successMessage = action.payload.message || "Gateways imported successfully!";
      })
      .addCase(batchImportGateways.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export the clear action to reset state if needed
export const { clearGatewaysState } = gatewaysSlice.actions;

export default gatewaysSlice.reducer;
