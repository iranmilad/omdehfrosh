import { createSlice } from "@reduxjs/toolkit";
import { sendTicketMessage } from "./newMessageTicketsActions";

const ticketSendMessageSlice = createSlice({
  name: "ticketSendMessage",
  initialState: {
    ticketData: null,
    sending: false,
    success: null,
    error: null,
  },
  reducers: {
    clearSendMessageStatus: (state) => {
      state.sending = false;
      state.success = null;
      state.error = null;
      state.ticketData = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendTicketMessage.pending, (state) => {
        state.sending = true;
        state.error = null;
        state.success = null;
      })
      .addCase(sendTicketMessage.fulfilled, (state, action) => {
        state.ticketData = action.payload; // Assuming the payload contains the updated ticket data
        state.sending = false;
        state.success = true;
      })
      .addCase(sendTicketMessage.rejected, (state, action) => {
        state.sending = false;
        state.error = action.payload;
      });
  },
});

export const { clearSendMessageStatus } = ticketSendMessageSlice.actions;
export default ticketSendMessageSlice.reducer;
