// getAllOrdersByUserIdSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { getAllOrdersByUserId } from "./getAllOrdersByUserIdActions.js";

const getAllOrdersByUserIdSlice = createSlice({
  name: "allOrdersByUserId",
  initialState: {
    ordersByUserId: [],
    loadingOrdersByUserId: false,
    errorOrdersByUserId: null,
  },
  reducers: {
    clearOrdersState: (state) => {
      state.ordersByUserId = [];
      state.errorOrdersByUserId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllOrdersByUserId.pending, (state) => {
        state.loadingOrdersByUserId = true;
        state.errorOrdersByUserId = null;
      })
      .addCase(getAllOrdersByUserId.fulfilled, (state, action) => {
        state.loadingOrdersByUserId = false;
        state.ordersByUserId = action.payload || [];
      })
      .addCase(getAllOrdersByUserId.rejected, (state, action) => {
        state.loadingOrdersByUserId = false;
        state.errorOrdersByUserId = action.payload;
      });
  },
});

export const { clearOrdersState } = getAllOrdersByUserIdSlice.actions;
export default getAllOrdersByUserIdSlice.reducer;
