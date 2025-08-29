import { createSlice } from "@reduxjs/toolkit";
import { getUserTickets } from "./getUserTicketsActions.js";

const userTicketsSlice = createSlice({
  name: "userTickets", // Slice name
  initialState: {
    userTickets: null, // The user tickets will be stored here
    loadingUserTickets: false,
    errorUserTickets: null,
  },
  reducers: {
    clearUserTicketsState: (state) => {
      state.userTickets = null;
      state.errorUserTickets = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserTickets.pending, (state) => {
        state.loadingUserTickets = true;
        state.errorUserTickets = null;
      })
      .addCase(getUserTickets.fulfilled, (state, action) => {
        state.loadingUserTickets = false;
        state.userTickets = action.payload || null; // Store the fetched tickets
      })
      .addCase(getUserTickets.rejected, (state, action) => {
        state.loadingUserTickets = false;
        state.errorUserTickets = action.payload; // Store error message
      });
  },
});

export const { clearUserTicketsState } = userTicketsSlice.actions;
export default userTicketsSlice.reducer;
