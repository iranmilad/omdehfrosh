import { createSlice } from "@reduxjs/toolkit";
import { addedToFavorites } from './addedToFavoritesActions';

const addedToFavoritesSlice = createSlice({
  name: "addedToFavorites",
  initialState: {
    addedToFavoritesData: null, // true or false
    loadingAddedToFavorites: false,
    errorAddedToFavorites: null,
  },
  reducers: {
    clearAddedFavoriteStatus: (state) => {
      state.addedToFavoritesData = null;
      state.loadingAddedToFavorites = false;
      state.errorAddedToFavorites = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addedToFavorites.pending, (state) => {
        state.loadingAddedToFavorites = true;
        state.errorAddedToFavorites = null;
      })
      .addCase(addedToFavorites.fulfilled, (state, action) => {
        state.loadingAddedToFavorites = false;
        state.addedToFavoritesData = action.payload;
      })
      .addCase(addedToFavorites.rejected, (state, action) => {
        state.loadingAddedToFavorites = false;
        state.errorAddedToFavorites = action.payload;
      });
  },
});

export const { clearAddedFavoriteStatus } = addedToFavoritesSlice.actions;
export default addedToFavoritesSlice.reducer;
