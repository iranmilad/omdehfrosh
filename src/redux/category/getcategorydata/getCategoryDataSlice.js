import { createSlice } from "@reduxjs/toolkit";
import { getCategoryData } from "./getCategoryDataActions";

const getCategoryDataSlice = createSlice({
  name: "categoryData",
  initialState: {
    categoryData: {},
    loadingCategoryData: false,
    errorCategoryData: null,
  },
  reducers: {
    clearCategoryDataState: (state) => {
      state.categoryData = [];
      loadingCategoryData = false,
      state.errorCategoryData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCategoryData.pending, (state) => {
        state.loadingCategoryData = true;
        state.errorCategoryData = null;
      })
      .addCase(getCategoryData.fulfilled, (state, action) => {
        state.loadingCategoryData = false;
        state.categoryData = action.payload || [];
      })
      .addCase(getCategoryData.rejected, (state, action) => {
        state.loadingCategoryData = false;
        state.errorCategoryData = action.payload;
      });
  },
});

export const { clearCategoryDataState } = getCategoryDataSlice.actions;
export default getCategoryDataSlice.reducer;
