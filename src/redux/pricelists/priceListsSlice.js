// priceListsSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { fetchPriceLists } from './priceListsActions';

const initialState = {
  data: [],
  loading: false,
  error: null,
};

const priceListsSlice = createSlice({
  name: 'priceLists',
  initialState,
  reducers: {
    clearPriceLists: (state) => {
      state.data = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPriceLists.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPriceLists.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchPriceLists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load price lists';
      });
  },
});

export const { clearPriceLists } = priceListsSlice.actions;
export default priceListsSlice.reducer;
