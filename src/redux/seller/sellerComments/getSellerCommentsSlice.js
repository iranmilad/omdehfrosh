import { createSlice } from "@reduxjs/toolkit";
import { getSellerComments } from "./getSellerCommentsActions.js";

const sellerCommentsSlice = createSlice({
  name: "sellerComments",
  initialState: {
    data: null,
    sellerCommentsLoading: false,
    sellerCommentsError: null,
  },
  reducers: {
    clearSellerCommentsState: (state) => {
      state.data = null;
      state.sellerCommentsError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSellerComments.pending, (state) => {
        state.sellerCommentsLoading = true;
        state.sellerCommentsError = null;
      })
      .addCase(getSellerComments.fulfilled, (state, action) => {
        state.sellerCommentsLoading = false;
        state.data = action.payload ?? null;
      })
      .addCase(getSellerComments.rejected, (state, action) => {
        state.sellerCommentsLoading = false;
        state.sellerCommentsError = action.payload;
      });
  },
});

export const { clearSellerCommentsState } = sellerCommentsSlice.actions;
export default sellerCommentsSlice.reducer;
