import { createSlice } from "@reduxjs/toolkit";
import { verifyMasterToken } from "./authMasterActions";

const authMasterSlice = createSlice({
  name: "authMaster",
  initialState: {
    user_master: null,
    isVerifiedMaster: null, // Start with null as it's unknown until verified
    loadingMaster: false,
    errorMaster: null,
  },
  reducers: {
    logout: (state) => {
      state.user_master = null;
      state.isVerifiedMaster = false;
      state.errorMaster = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyMasterToken.pending, (state) => {
        state.loadingMaster = true;
        state.errorMaster = null;
      })
      .addCase(verifyMasterToken.fulfilled, (state, action) => {
        state.loadingMaster = false;
        state.isVerifiedMaster = action.payload.valid;  // Set the verification status
        state.user_master = action.payload.user; // Save the user_master data if available
      })
      .addCase(verifyMasterToken.rejected, (state, action) => {
        state.loadingMaster = false;
        state.isVerifiedMaster = false; // If the token is invalid, mark as not verified
        state.errorMaster = action.payload;
      });
  },
});

export const { logout } = authMasterSlice.actions;
export default authMasterSlice.reducer;
