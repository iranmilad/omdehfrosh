import { createSlice } from "@reduxjs/toolkit";
import { getSubscriptionByUserId } from "./getSubscriptionByUserIdActions.js";

const getSubscriptionByUserIdSlice = createSlice({
  name: "subscriptionByUserId",
  initialState: {
    subscriptionByUserId: null,
    loadingSubscriptionByUserId: false,
    errorSubscriptionByUserId: null,
  },
  reducers: {
    clearSubscriptionByUserIdState: (state) => {
      state.subscriptionByUserId = null;
      state.loadingSubscriptionByUserId = false;
      state.errorSubscriptionByUserId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSubscriptionByUserId.pending, (state) => {
        state.loadingSubscriptionByUserId = true;
        state.errorSubscriptionByUserId = null;
      })
      .addCase(getSubscriptionByUserId.fulfilled, (state, action) => {
        state.loadingSubscriptionByUserId = false;
        state.subscriptionByUserId = action.payload || null;
      })
      .addCase(getSubscriptionByUserId.rejected, (state, action) => {
        state.loadingSubscriptionByUserId = false;
        state.errorSubscriptionByUserId = action.payload;
      });
  },
});

export const { clearSubscriptionByUserIdState } = getSubscriptionByUserIdSlice.actions;
export default getSubscriptionByUserIdSlice.reducer;
