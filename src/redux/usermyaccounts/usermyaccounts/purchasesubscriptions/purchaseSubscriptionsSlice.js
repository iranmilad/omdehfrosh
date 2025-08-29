import { createSlice } from "@reduxjs/toolkit";
import { purchaseSubscriptionByModelId } from "./purchaseSubscriptionsActions";

const purchaseSubscriptionSlice = createSlice({
  name: "purchaseSubscription",
  initialState: {
    purchaseResponse: null, // Store the subscription purchase response
    loadingPurchaseSubscription: false,
    errorPurchaseSubscription: null,
    successPurchaseSubscription: false,
  },
  reducers: {
    clearPurchaseState: (state) => {
      state.purchaseResponse = null;
      state.loadingPurchaseSubscription = false;
      state.errorPurchaseSubscription = null;
      state.successPurchaseSubscription = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(purchaseSubscriptionByModelId.pending, (state) => {
        state.loadingPurchaseSubscription = true;
        state.errorPurchaseSubscription = null;
      })
      .addCase(purchaseSubscriptionByModelId.fulfilled, (state, action) => {
        state.loadingPurchaseSubscription = false;
        state.successPurchaseSubscription = true; // Set success to true on successful purchase
        state.purchaseResponse = action.payload; // Store the purchase response
      })
      .addCase(purchaseSubscriptionByModelId.rejected, (state, action) => {
        state.loadingPurchaseSubscription = false;
        state.errorPurchaseSubscription = action.payload; // Store error message
      });
  },
});

export const { clearPurchaseState } = purchaseSubscriptionSlice.actions;
export default purchaseSubscriptionSlice.reducer;
