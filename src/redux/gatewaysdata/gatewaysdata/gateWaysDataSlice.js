import { createSlice } from "@reduxjs/toolkit";
import { getAllGateWaysData } from "./gateWaysDataActions";

const gateWaysDataSlice = createSlice({
  name: "gateWaysData",
  initialState: {
    gateways: [], // Array to store fetched gateways data
    loading: false, // Loading state
    error: null, // Error state for any fetch issues
  },
  reducers: {
    // Optional: Additional reducers for clearing error or other states
    clearGateWaysDataState: (state) => {
      state.gateways = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllGateWaysData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllGateWaysData.fulfilled, (state, action) => {
        state.loading = false;
        state.gateways = action.payload || []; // Store the fetched data
      })
      .addCase(getAllGateWaysData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // Handle errors
      });
  },
});

export const { clearGateWaysDataState } = gateWaysDataSlice.actions;
export default gateWaysDataSlice.reducer;
