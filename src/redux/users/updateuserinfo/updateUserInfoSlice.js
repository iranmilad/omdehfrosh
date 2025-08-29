import { createSlice } from "@reduxjs/toolkit";
import { updateUserInfo } from './updateUserInforActions'

const updateUserInfoSlice = createSlice({
  name: "updateUserInfo",
  initialState: {
    updateuser: {},
    loadingUpdateUser: false,
    errorUpdateUser: null,
  },
  reducers: {
    clearUserInfo: (state) => {
      state.updateuser = {};
      state.loadingUpdateUser = false;
      state.errorUpdateUser = null;
    },
  },  
  extraReducers: (builder) => {
    builder
      // Handling user info update
      .addCase(updateUserInfo.pending, (state) => {
        state.loadingUpdateUser = true;
        state.errorUpdateUser = null;
      })
      .addCase(updateUserInfo.fulfilled, (state, action) => {
        state.loadingUpdateUser = false;
        state.updateuser = action.payload || null;
      })
      .addCase(updateUserInfo.rejected, (state, action) => {
        state.loadingUpdateUser = false;
        state.errorUpdateUser = action.payload;
      });
  },
});

export const { clearUserInfo } = updateUserInfoSlice.actions;
export default updateUserInfoSlice.reducer;
