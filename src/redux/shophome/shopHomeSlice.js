import { createSlice } from "@reduxjs/toolkit";
import { fetchShopHomeData } from "./shopHomeActions";

const shopHomeSlice = createSlice({
  name: "shopHome",
  initialState: {
    homeData: null,
    loadingShopHome: false,
    errorShopHome: null,
    successShopHome: false,
    lastFetched: null
  },
  reducers: {
    clearShopHomeState: (state) => {
      state.homeData = null;
      state.loadingShopHome = false;
      state.errorShopHome = null;
      state.successShopHome = false;
      state.lastFetched = null;
    },
    resetShopHomeError: (state) => {
      state.errorShopHome = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchShopHomeData.pending, (state) => {
        state.loadingShopHome = true;
        state.errorShopHome = null;
      })
      .addCase(fetchShopHomeData.fulfilled, (state, action) => {
        state.loadingShopHome = false;
        state.successShopHome = true;
        state.homeData = action.payload.data;
        state.lastFetched = Date.now();
      })
      .addCase(fetchShopHomeData.rejected, (state, action) => {
        state.loadingShopHome = false;
        state.errorShopHome = action.payload;
        state.successShopHome = false;
      });
  },
});

export const { clearShopHomeState, resetShopHomeError } = shopHomeSlice.actions;
export default shopHomeSlice.reducer;