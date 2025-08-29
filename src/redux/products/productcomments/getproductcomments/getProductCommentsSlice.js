import { createSlice } from "@reduxjs/toolkit";
import { getProductComments } from "./getProductCommentsActions.js"; // Correct import

const productCommentsSlice = createSlice({
  name: "productComments",
  initialState: {
    productComments: [],
    productCommentsLoading: false,
    productCommentsError: null,
  },
  reducers: {
    clearCommentsState: (state) => {
      state.productComments = [];
      state.productCommentsError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProductComments.pending, (state) => {
        state.productCommentsLoading = true;
        state.productCommentsError = null;
      })
      .addCase(getProductComments.fulfilled, (state, action) => {
        state.productCommentsLoading = false;
        state.productComments = action.payload || [];
      })
      .addCase(getProductComments.rejected, (state, action) => {
        state.productCommentsLoading = false;
        state.productCommentsError = action.payload;
      });
  },
});

export const { clearCommentsState } = productCommentsSlice.actions;
export default productCommentsSlice.reducer;
