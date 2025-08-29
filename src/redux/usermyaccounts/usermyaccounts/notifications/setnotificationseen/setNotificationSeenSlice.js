import { createSlice } from "@reduxjs/toolkit";
import { setNotificationSeen } from "./setNotificationSeenActions.js";

const notificationSeenSlice = createSlice({
  name: "notificationSeen",
  initialState: {
    successSetNotificationSeen: false,
    loadingSetNotificationSeen: false,
    errorSetNotificationSeen: null,
  },
  reducers: {
    clearNotificationSeenState: (state) => {
      state.successSetNotificationSeen = false;
      state.errorSetNotificationSeen = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(setNotificationSeen.pending, (state) => {
        state.loadingSetNotificationSeen = true;
        state.errorSetNotificationSeen = null;
        state.successSetNotificationSeen = false;
      })
      .addCase(setNotificationSeen.fulfilled, (state) => {
        state.loadingSetNotificationSeen = false;
        state.successSetNotificationSeen = true;
      })
      .addCase(setNotificationSeen.rejected, (state, action) => {
        state.loadingSetNotificationSeen = false;
        state.errorSetNotificationSeen = action.payload;
      });
  },
});

export const { clearNotificationSeenState } = notificationSeenSlice.actions;
export default notificationSeenSlice.reducer;
