import { createSlice } from "@reduxjs/toolkit";
import { getsubscriptionPlansGet } from "./getSubscriptionPlansActions.js";


const subscriptionPlansGetSlice = createSlice({
  name: "subscriptionPlansGet", // Slice name
  initialState: {
    subscriptionPlansGet: [], // The subscription plans will be stored here
    loadingsubscriptionPlansGet: false,
    errorsubscriptionPlansGet: null,
  },
  reducers: {
    clearsubscriptionPlansGetState: (state) => {
      state.subscriptionPlansGet = [];
      state.errorsubscriptionPlansGet = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getsubscriptionPlansGet.pending, (state) => {
        state.loadingsubscriptionPlansGet = true;
        state.errorsubscriptionPlansGet = null;
      })
      .addCase(getsubscriptionPlansGet.fulfilled, (state, action) => {
        state.loadingsubscriptionPlansGet = false;
        state.subscriptionPlansGet = action.payload || []; // Store the fetched subscription plans
      })
      .addCase(getsubscriptionPlansGet.rejected, (state, action) => {
        state.loadingsubscriptionPlansGet = false;
        state.errorsubscriptionPlansGet = action.payload; // Store error message
      });
  },
});

export const { clearsubscriptionPlansGetState } = subscriptionPlansGetSlice.actions;
export default subscriptionPlansGetSlice.reducer;
