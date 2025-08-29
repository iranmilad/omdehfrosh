import { createSlice } from "@reduxjs/toolkit";
import { getUserMessagesById } from "./getUserMessagesByIdActions.js";

const userMessagesByIdSlice = createSlice({
  name: "userMessagesById", // Slice name
  initialState: {
    userMessages: null,  // The user messages will be stored here
    loadingUserMessagesById: false,
    errorUserMessagesById: null,
  },
  reducers: {
    clearUserMessagesState: (state) => {
      state.userMessages = null;
      state.errorUserMessagesById = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserMessagesById.pending, (state) => {
        state.loadingUserMessagesById = true;
        state.errorUserMessagesById = null;
      })
      .addCase(getUserMessagesById.fulfilled, (state, action) => {
        state.loadingUserMessagesById = false;
        state.userMessages = action.payload || null; // Store the fetched messages
      })
      .addCase(getUserMessagesById.rejected, (state, action) => {
        state.loadingUserMessagesById = false;
        state.errorUserMessagesById = action.payload; // Store error message
      });
  },
});

export const { clearUserMessagesState } = userMessagesByIdSlice.actions;
export default userMessagesByIdSlice.reducer;
