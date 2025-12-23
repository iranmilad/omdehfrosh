import { createSlice } from "@reduxjs/toolkit";
import { bulkUpdatePrices } from "./bulkPriceUpdateActions";

const bulkPriceUpdateSlice = createSlice({
  name: "bulkPriceUpdate",
  initialState: {
    loading: false,
    success: false,
    error: null,
    updatedCount: 0,
    message: null,
  },
  reducers: {
    clearState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.updatedCount = 0;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bulkUpdatePrices.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.message = null;
      })
      .addCase(bulkUpdatePrices.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.updatedCount = action.payload.updatedCount || 0;
        state.message = action.payload.message || "قیمت‌ها با موفقیت بروزرسانی شدند";
      })
      .addCase(bulkUpdatePrices.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
        state.message = action.payload?.message || "خطایی رخ داده است";
      });
  },
});

export const { clearState } = bulkPriceUpdateSlice.actions;
export default bulkPriceUpdateSlice.reducer;