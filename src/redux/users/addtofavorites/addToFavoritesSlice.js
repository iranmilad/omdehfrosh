import { createSlice } from "@reduxjs/toolkit";
import { addToFavorites } from './addToFavoritesActions';

const addToFavoritesSlice = createSlice({
  name: "addToFavorites",
  initialState: {
    addToFavoritesData: null,
    loadingAddToFavorites: false,
    errorAddToFavorites: null,
  },
  reducers: {
    clearAddFavoriteStatus: (state) => {
      state.addToFavoritesData = null;
      state.loadingAddToFavorites = false;
      state.errorAddToFavorites = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToFavorites.pending, (state) => {
        state.loadingAddToFavorites = true;
        state.errorAddToFavorites = null;
      })
      .addCase(addToFavorites.fulfilled, (state, action) => {
        state.loadingAddToFavorites = false;
        state.addToFavoritesData = action.payload;
      })
      .addCase(addToFavorites.rejected, (state, action) => {
        state.loadingAddToFavorites = false;
        state.errorAddToFavorites = action.payload;
      });
  },
});

export const { clearAddFavoriteStatus } = addToFavoritesSlice.actions;
export default addToFavoritesSlice.reducer;
