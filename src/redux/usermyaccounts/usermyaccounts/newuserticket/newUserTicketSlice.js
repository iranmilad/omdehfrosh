import { createSlice } from "@reduxjs/toolkit";
import { createNewUserTicket } from "./newUserTicketActions";

const newUserTicketSlice = createSlice({
  name: "newUserTicket",
  initialState: {
    ticket: null, // Store the created ticket
    loadingNewUserTicket: false,
    errorNewUserTicket: null,
    successNewUserTicket: false
  },
  reducers: {
    clearTicketCreationState: (state) => {
      state.ticket = null;
      state.loadingNewUserTicket = false;
      state.errorNewUserTicket = null;
      state.successNewUserTicket = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createNewUserTicket.pending, (state) => {
        state.loadingNewUserTicket = true;
        state.errorNewUserTicket = null;
      })
      .addCase(createNewUserTicket.fulfilled, (state, action) => {
        state.loadingNewUserTicket = false;
        state.successNewUserTicket = true; // Set successNewUserTicket to true on successNewUserTicketful creation
        state.ticket = action.payload; // Store the created ticket
      })
      .addCase(createNewUserTicket.rejected, (state, action) => {
        state.loadingNewUserTicket = false;
        state.errorNewUserTicket = action.payload;
      });
  },
});

export const { clearTicketCreationState } = newUserTicketSlice.actions;
export default newUserTicketSlice.reducer;
