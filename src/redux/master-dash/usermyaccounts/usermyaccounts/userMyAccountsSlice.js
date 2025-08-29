import { createSlice } from "@reduxjs/toolkit";
import { batchImportUserMyAccounts } from "./userMyAccountsActions";

const userMyAccountsSlice = createSlice({
  name: "userMyAccounts",
  initialState: {
    accounts: null,
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    // Clear state if needed
    clearUserMyAccountsState: (state) => {
      state.accounts = null;
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(batchImportUserMyAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(batchImportUserMyAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = action.payload.accounts || null;
        state.successMessage = action.payload.message || "User accounts imported successfully!";
      })
      .addCase(batchImportUserMyAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearUserMyAccountsState } = userMyAccountsSlice.actions;
export default userMyAccountsSlice.reducer;
