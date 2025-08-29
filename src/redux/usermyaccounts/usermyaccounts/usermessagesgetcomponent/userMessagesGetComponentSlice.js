// userMessagesGetComponentSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { userMessagesGetComponent, markNotificationAsRead } from "./userMessagesGetComponentActions.js";

const userMessagesGetComponentSlice = createSlice({
  name: "userMessagesGetComponent",
  initialState: {
    userMessagesComponent: null,
    notificationIds: [],
    notificationCount: 0,
    loadingUserMessagesComponent: false,
    errorUserMessagesComponent: null,
    // Mark as read states
    markingAsRead: false,
    markAsReadError: null,
  },
  reducers: {
    clearUserMessagesComponentState: (state) => {
      state.userMessagesComponent = null;
      state.notificationIds = [];
      state.notificationCount = 0;
      state.errorUserMessagesComponent = null;
      state.markAsReadError = null;
    },
    clearMarkAsReadError: (state) => {
      state.markAsReadError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get component cases
      .addCase(userMessagesGetComponent.pending, (state) => {
        state.loadingUserMessagesComponent = true;
        state.errorUserMessagesComponent = null;
      })
      .addCase(userMessagesGetComponent.fulfilled, (state, action) => {
        state.loadingUserMessagesComponent = false;
        state.userMessagesComponent = action.payload?.component || null;
        state.notificationIds = action.payload?.notificationIds || [];
        state.notificationCount = action.payload?.count || 0;
      })
      .addCase(userMessagesGetComponent.rejected, (state, action) => {
        state.loadingUserMessagesComponent = false;
        state.errorUserMessagesComponent = action.payload;
      })
      // Mark as read cases
      .addCase(markNotificationAsRead.pending, (state) => {
        state.markingAsRead = true;
        state.markAsReadError = null;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.markingAsRead = false;
        // Optionally remove the notification ID from the array if it was successfully marked as read
        // state.notificationIds = state.notificationIds.filter(id => id !== action.payload.notificationId);
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.markingAsRead = false;
        state.markAsReadError = action.payload;
      });
  },
});

export const { clearUserMessagesComponentState, clearMarkAsReadError } = userMessagesGetComponentSlice.actions;
export default userMessagesGetComponentSlice.reducer;