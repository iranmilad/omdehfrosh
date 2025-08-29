import { createSlice } from "@reduxjs/toolkit";
import { batchImportMyAccountTickets } from "./myAccountTicketsActions";

const myAccountTicketsSlice = createSlice({
  name: "myAccountTickets",
  initialState: {
    tickets: [],
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearMyAccountTicketsState: (state) => {
      state.tickets = [];
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(batchImportMyAccountTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(batchImportMyAccountTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = action.payload.tickets || [];
        state.successMessage = action.payload.message || "Tickets imported successfully!";
      })
      .addCase(batchImportMyAccountTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMyAccountTicketsState } = myAccountTicketsSlice.actions;
export default myAccountTicketsSlice.reducer;
