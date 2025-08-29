import { createSlice } from "@reduxjs/toolkit";
import { userMessagesModalComponentGet } from "./userMessagesModalComponentGetActions";

const userMessagesModalComponentGetSlice = createSlice({
  name: "userMessagesModalComponentGet",
  initialState: {
    userMessagesModal: null,
    loadingUserMessagesModal: false,
    errorUserMessagesModal: null,
  },
  reducers: {
    clearUserMessagesModalState: (state) => {
      state.userMessagesModal = null;
      state.errorUserMessagesModal = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(userMessagesModalComponentGet.pending, (state) => {
        state.loadingUserMessagesModal = true;
        state.errorUserMessagesModal = null;
      })
      .addCase(userMessagesModalComponentGet.fulfilled, (state, action) => {
        state.loadingUserMessagesModal = false;
        state.userMessagesModal = action.payload || null;
      })
      .addCase(userMessagesModalComponentGet.rejected, (state, action) => {
        state.loadingUserMessagesModal = false;
        state.errorUserMessagesModal = action.payload;
      });
  },
});

export const { clearUserMessagesModalState } = userMessagesModalComponentGetSlice.actions;
export default userMessagesModalComponentGetSlice.reducer;
