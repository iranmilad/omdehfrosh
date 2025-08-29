import { createSlice } from "@reduxjs/toolkit";
import { batchImportPriceList } from "./priceListActions";

const priceListSlice = createSlice({
  name: "priceList",
  initialState: {
    items: [],
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearPriceListState: (state) => {
      state.items = [];
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(batchImportPriceList.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(batchImportPriceList.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.priceList || [];
        state.successMessage = action.payload.message || "Price list imported successfully!";
      })
      .addCase(batchImportPriceList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPriceListState } = priceListSlice.actions;
export default priceListSlice.reducer;
