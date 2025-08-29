import { createSlice } from "@reduxjs/toolkit";
import { getUserFavoritesList } from './listActions';





const getUserFavoritesListSlice = createSlice({
  name: "getUserFavoritesList",
  initialState: {
    getUserFavoritesListData: [], // Array of favorite products
    loadingGetUserFavoritesList: false,
    errorGetUserFavoritesList: null,
  },
  reducers: {
    clearGetUserFavoritesList: (state) => {
      state.getUserFavoritesListData = [];
      state.loadingGetUserFavoritesList = false;
      state.errorGetUserFavoritesList = null;
    },
    // Helper to check if a product is in favorites (for quick lookups)
    updateLocalFavoriteStatus: (state, action) => {
      const { productId, isFavorite } = action.payload;
      
      if (isFavorite) {
        // Add to favorites if not already present
        const exists = state.getUserFavoritesListData.some(item => item.id === productId);
        if (!exists) {
          state.getUserFavoritesListData.push({ id: productId });
        }
      } else {
        // Remove from favorites
        state.getUserFavoritesListData = state.getUserFavoritesListData.filter(
          item => item.id !== productId
        );
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserFavoritesList.pending, (state) => {
        state.loadingGetUserFavoritesList = true;
        state.errorGetUserFavoritesList = null;
      })
      .addCase(getUserFavoritesList.fulfilled, (state, action) => {
        state.loadingGetUserFavoritesList = false;
        state.getUserFavoritesListData = action.payload;
      })
      .addCase(getUserFavoritesList.rejected, (state, action) => {
        state.loadingGetUserFavoritesList = false;
        state.errorGetUserFavoritesList = action.payload;
      });
  },
});

export const { clearGetUserFavoritesList, updateLocalFavoriteStatus } = getUserFavoritesListSlice.actions;
export default getUserFavoritesListSlice.reducer;