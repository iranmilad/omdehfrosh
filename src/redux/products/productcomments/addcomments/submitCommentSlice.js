// src/store/comments/slices/submitCommentSlice.js

import { createSlice } from "@reduxjs/toolkit";
import { submitComment } from "./submitCommentActions";

const submitCommentSlice = createSlice({
  name: "submitComment",
  initialState: {
    submittedComment: {},
    submitLoading: false,
    submitError: null,
  },
  reducers: {
    clearSubmitCommentState: (state) => {
      state.submittedComment = {};
      state.submitLoading = false;
      state.submitError = null;
    },
    resetSubmitError: (state) => {
      state.submitError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitComment.pending, (state) => {
        state.submitLoading = true;
        state.submitError = null;
      })
      .addCase(submitComment.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.submittedComment = action.payload || null;
      })
      .addCase(submitComment.rejected, (state, action) => {
        state.submitLoading = false;
        state.submitError = action.payload;
      });
  },
});

export const { clearSubmitCommentState, resetSubmitError } = submitCommentSlice.actions;
export default submitCommentSlice.reducer;