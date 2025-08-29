import { createSlice } from "@reduxjs/toolkit";
import { updateOrderDelivered } from "./updateOrderDeliveredActions"; // Correct import

const orderStatusUpdateSlice = createSlice({
  name: "orderStatusUpdate", // Slice name
  initialState: {
    order: null, // Stores the order details
    loadingStatusUpdate: false, // Indicates if the status update request is in progress
    errorStatusUpdate: null, // Holds error message for failed status update
    deliveredStatus: null, // Stores the delivered status of the order
  },
  reducers: {
    clearOrderStatusUpdateState: (state) => {
      state.order = null;
      state.deliveredStatus = null;
      state.errorStatusUpdate = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateOrderDelivered.pending, (state) => {
        state.loadingStatusUpdate = true;
        state.errorStatusUpdate = null;
      })
      .addCase(updateOrderDelivered.fulfilled, (state, action) => {
        state.loadingStatusUpdate = false;
        state.deliveredStatus = action.payload?.deliveredStatus || null;
      })
      .addCase(updateOrderDelivered.rejected, (state, action) => {
        state.loadingStatusUpdate = false;
        state.errorStatusUpdate = action.payload;
      });
  },
});

export const { clearOrderStatusUpdateState } = orderStatusUpdateSlice.actions;
export default orderStatusUpdateSlice.reducer;
