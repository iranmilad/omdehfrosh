import { createSlice } from "@reduxjs/toolkit";
import { getUserTicketById } from './getUserTicketByIdActions.js'



const getUserTicketByIdSlice = createSlice({
  name: "userTicketById",
  initialState: {
    userTicketById: null,
    loadingUserTicketById: false,
    errorUserTicketById: null,
  },
  reducers: {
    clearUserTicketByIdState: (state) => {
      state.userTicketById = null;
      state.errorUserTicketById = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserTicketById.pending, (state) => {
        state.loadingUserTicketById = true;
        state.errorUserTicketById = null;
      })
      .addCase(getUserTicketById.fulfilled, (state, action) => {
        state.loadingUserTicketById = false;
        state.userTicketById = action.payload || null;
      })
      .addCase(getUserTicketById.rejected, (state, action) => {
        state.loadingUserTicketById = false;
        state.errorUserTicketById = action.payload;
      });
  },
});

export const { clearUserTicketByIdState } = getUserTicketByIdSlice.actions;
export default getUserTicketByIdSlice.reducer;
