import { createSlice } from "@reduxjs/toolkit";
import { getSingleProductDetails } from "./singleProductPageGetActions.js"; // Correct import

const singleProductPageSlice = createSlice({
  name: "singleProduct",
  initialState: {
    product: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearProductState: (state) => {
      state.product = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSingleProductDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSingleProductDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload || null;
      })
      .addCase(getSingleProductDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProductState } = singleProductPageSlice.actions;
export default singleProductPageSlice.reducer;