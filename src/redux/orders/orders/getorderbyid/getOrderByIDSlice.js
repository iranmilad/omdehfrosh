import { createSlice } from "@reduxjs/toolkit";
import { getOrderByID } from "./getOrderByIDActions.js"; // Correct import

const getOrderByIDSlice = createSlice({
  name: "order",
  initialState: {
    order: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearOrderState: (state) => {
      state.order = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getOrderByID.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrderByID.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload || null;
      })
      .addCase(getOrderByID.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearOrderState } = getOrderByIDSlice.actions;
export default getOrderByIDSlice.reducer;
