import { createSlice } from "@reduxjs/toolkit";
import { batchImportNotificationTables } from "./notificationTablesActions";

const notificationTablesSlice = createSlice({
  name: "notificationTables",
  initialState: {
    tables: [],
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearNotificationTablesState: (state) => {
      state.tables = [];
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(batchImportNotificationTables.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(batchImportNotificationTables.fulfilled, (state, action) => {
        state.loading = false;
        state.tables = action.payload.notificationTables || [];
        state.successMessage = action.payload.message || "Notification tables imported successfully!";
      })
      .addCase(batchImportNotificationTables.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearNotificationTablesState } = notificationTablesSlice.actions;
export default notificationTablesSlice.reducer;
