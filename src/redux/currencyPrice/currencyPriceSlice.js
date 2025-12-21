import { createSlice } from "@reduxjs/toolkit";
import { 
  updateCurrencyPrice, 
  getCurrencyPrice,
  deleteCurrencyPrice 
} from "./currencyPriceActions";

const currencyPriceSlice = createSlice({
  name: "currencyPrice",
  initialState: {
    currencyPrice: null,
    currency: "USD",
    loading: false,
    error: null,
    successMessage: null,
    isDefault: false, // Track if showing default values
  },
  reducers: {
    clearCurrencyPriceState: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    clearCurrencyPriceError: (state) => {
      state.error = null;
    },
    resetCurrencyPrice: (state) => {
      state.currencyPrice = null;
      state.currency = "USD";
      state.error = null;
      state.successMessage = null;
      state.isDefault = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Update currency price
      .addCase(updateCurrencyPrice.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateCurrencyPrice.fulfilled, (state, action) => {
        state.loading = false;
        state.currencyPrice = action.payload.data?.price;
        state.currency = action.payload.data?.currency;
        state.successMessage = action.payload.message;
        state.isDefault = false;
      })
      .addCase(updateCurrencyPrice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get currency price
      .addCase(getCurrencyPrice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrencyPrice.fulfilled, (state, action) => {
        state.loading = false;
        state.currencyPrice = action.payload.data?.price;
        state.currency = action.payload.data?.currency || "USD";
        state.isDefault = action.payload.data?.isDefault || false;
      })
      .addCase(getCurrencyPrice.rejected, (state, action) => {
        state.loading = false;
        // Don't set error for 404 - it just means no price exists yet
        if (action.payload?.status !== 404) {
          state.error = action.payload;
        } else {
          // Set default values for 404
          state.currencyPrice = null;
          state.currency = "USD";
          state.isDefault = true;
        }
      })
      
      // Delete currency price
      .addCase(deleteCurrencyPrice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCurrencyPrice.fulfilled, (state, action) => {
        state.loading = false;
        state.currencyPrice = null;
        state.currency = "USD";
        state.successMessage = action.payload.message;
        state.isDefault = true;
      })
      .addCase(deleteCurrencyPrice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearCurrencyPriceState,
  clearCurrencyPriceError,
  resetCurrencyPrice 
} = currencyPriceSlice.actions;

export default currencyPriceSlice.reducer;