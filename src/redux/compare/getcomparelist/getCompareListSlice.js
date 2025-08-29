import { createSlice } from "@reduxjs/toolkit";
import { getCompareListData } from "./getCompareListActions";

const getCompareListSlice = createSlice({
  name: "compareList",
  initialState: {
    compareListData: [],
    loadingCompareList: false,
    errorCompareList: null,
  },
  reducers: {
    clearCompareListState: (state) => {
      state.compareListData = [];
      state.loadingCompareList = false;
      state.errorCompareList = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCompareListData.pending, (state) => {
        state.loadingCompareList = true;
        state.errorCompareList = null;
      })
      .addCase(getCompareListData.fulfilled, (state, action) => {
        state.loadingCompareList = false;
        state.compareListData = action.payload || [];
      })
      .addCase(getCompareListData.rejected, (state, action) => {
        state.loadingCompareList = false;
        state.errorCompareList = action.payload;
      });
  },
});

export const { clearCompareListState } = getCompareListSlice.actions;
export default getCompareListSlice.reducer;
