import { createSlice } from "@reduxjs/toolkit";
import { removeFromFavorites } from './removeFromFavoritesActions'

const removeFromFavoritesSlice = createSlice({
  name: "removeFromFavorites",
  initialState: {
    removeFromFavoritesData: null, // true or false
    loadingRemoveFromFavorites: false,
    errorRemoveFromFavorites: null,
  },
  reducers: {
    clearRemoveFavoriteStatus: (state) => {
      state.removeFromFavoritesData = null;
      state.loadingRemoveFromFavorites = false;
      state.errorRemoveFromFavorites = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(removeFromFavorites.pending, (state) => {
        state.loadingRemoveFromFavorites = true;
        state.errorRemoveFromFavorites = null;
      })
      .addCase(removeFromFavorites.fulfilled, (state, action) => {
        state.loadingRemoveFromFavorites = false;
        state.removeFromFavoritesData = action.payload;
      })
      .addCase(removeFromFavorites.rejected, (state, action) => {
        state.loadingRemoveFromFavorites = false;
        state.errorRemoveFromFavorites = action.payload;
      });
  },
});

export const { clearRemoveFavoriteStatus } = removeFromFavoritesSlice.actions;
export default removeFromFavoritesSlice.reducer;
