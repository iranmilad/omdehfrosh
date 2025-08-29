import { createSlice } from "@reduxjs/toolkit";
import { batchImportUserMessages } from "./userMessagesActions";

const userMessagesSlice = createSlice({
  name: "userMessages",
  initialState: {
    messages: [],
    loading: false,
    error: null,
    successMessage: null, // For success message after batch import
  },
  reducers: {
    clearUserMessagesState: (state) => {
      state.messages = [];
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(batchImportUserMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(batchImportUserMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload.messages || [];
        state.successMessage = action.payload.message || "User messages imported successfully!";
      })
      .addCase(batchImportUserMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearUserMessagesState } = userMessagesSlice.actions;
export default userMessagesSlice.reducer;
