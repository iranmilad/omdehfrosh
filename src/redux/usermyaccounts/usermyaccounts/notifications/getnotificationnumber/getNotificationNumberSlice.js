import { createSlice } from "@reduxjs/toolkit";
import { getNotificationNumber } from "./getNotificationNumberActions.js";

const notificationNumberSlice = createSlice({
  name: "notificationNumber",
  initialState: {
    notificationNumber: null,
    loadingNotificationNumber: false,
    errorNotificationNumber: null,
  },
  reducers: {
    clearNotificationNumberState: (state) => {
      state.notificationNumber = null;
      state.errorNotificationNumber = null;
    },
    updateNotificationCount: (state, action) => {
      state.notificationNumber = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getNotificationNumber.pending, (state) => {
        state.loadingNotificationNumber = true;
        state.errorNotificationNumber = null;
      })
      .addCase(getNotificationNumber.fulfilled, (state, action) => {
        state.loadingNotificationNumber = false;
        
        if (typeof action.payload === 'object' && action.payload !== null) {
          state.notificationNumber = action.payload;
        } else {
          state.notificationNumber = {
            unreadCount: action.payload || 0,
            success: true
          };
        }
      })
      .addCase(getNotificationNumber.rejected, (state, action) => {
        state.loadingNotificationNumber = false;
        state.errorNotificationNumber = action.payload;
      });
  },
});

export const { clearNotificationNumberState, updateNotificationCount } = notificationNumberSlice.actions;
export default notificationNumberSlice.reducer;