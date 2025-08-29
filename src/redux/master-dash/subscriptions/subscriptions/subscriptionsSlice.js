import { createSlice } from "@reduxjs/toolkit";
import { batchImportSubscriptions } from "./subscriptionsActions";



const subscriptionsSlice = createSlice({
  name: "subscriptions",
  initialState: {
    plans: [],
    loading: false,
    error: null,
    successMessage: null, // For success message after batch import
  },
  reducers: {
    clearSubscriptionsState: (state) => {
      state.plans = [];
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(batchImportSubscriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(batchImportSubscriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = action.payload.subscriptions || [];
        state.successMessage = action.payload.message || "Subscriptions imported successfully!";
      })
      .addCase(batchImportSubscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSubscriptionsState } = subscriptionsSlice.actions;
export default subscriptionsSlice.reducer;
