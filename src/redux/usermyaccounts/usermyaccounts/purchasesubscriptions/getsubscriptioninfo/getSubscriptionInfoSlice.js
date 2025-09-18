import { createSlice } from "@reduxjs/toolkit";
import { getSubscriptionInfoByModelId } from "./getSubscriptionInfoActions";

const getSubscriptionInfoSlice = createSlice({
  name: "getSubscriptionInfo",
  initialState: {
    subscriptionInfo: null,       // Holds subscription details
    loadingSubscriptionInfo: false,
    errorSubscriptionInfo: null,
    showSubscriptionModal: false, // Controls modal visibility
  },
  reducers: {
    clearSubscriptionInfoState: (state) => {
      state.subscriptionInfo = null;
      state.loadingSubscriptionInfo = false;
      state.errorSubscriptionInfo = null;
      state.showSubscriptionModal = false;
    },
    setShowSubscriptionModal: (state, action) => {
      state.showSubscriptionModal = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSubscriptionInfoByModelId.pending, (state) => {
        state.loadingSubscriptionInfo = true;
        state.errorSubscriptionInfo = null;
        state.showSubscriptionModal = false;
      })
      .addCase(getSubscriptionInfoByModelId.fulfilled, (state, action) => {
        state.loadingSubscriptionInfo = false;
        state.subscriptionInfo = action.payload;
        state.showSubscriptionModal = true; // open modal when data fetched
      })
      .addCase(getSubscriptionInfoByModelId.rejected, (state, action) => {
        state.loadingSubscriptionInfo = false;
        state.errorSubscriptionInfo = action.payload;
        state.showSubscriptionModal = false;
      });
  },
});

export const {
  clearSubscriptionInfoState,
  setShowSubscriptionModal,
} = getSubscriptionInfoSlice.actions;

export default getSubscriptionInfoSlice.reducer;
