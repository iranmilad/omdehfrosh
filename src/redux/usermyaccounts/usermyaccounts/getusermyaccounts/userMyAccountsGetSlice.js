import { createSlice } from "@reduxjs/toolkit";
import { getUserMyAccount } from "./userMyAccountsGetActions.js";

const userMyAccountsGetSlice = createSlice({
  name: "userMyAccountsGet",
  initialState: {
    userAccount: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearUserMyAccountState: (state) => {
      state.userAccount = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserMyAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserMyAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.userAccount = action.payload || null;
      })
      .addCase(getUserMyAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearUserMyAccountState } = userMyAccountsGetSlice.actions;
export default userMyAccountsGetSlice.reducer;
