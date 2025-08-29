import { useCookies } from "react-cookie";

// Custom hook to manage favorites from cookies
export const useFavorites = () => {
  const [cookies, setCookie, removeCookie] = useCookies(["userFavorites"]);

  const getFavorites = () => {
    try {
      if (!cookies.userFavorites) {
        return [];
      }
      
      // Handle both string and already parsed object
      const favoritesData = typeof cookies.userFavorites === 'string' 
        ? JSON.parse(cookies.userFavorites) 
        : cookies.userFavorites;
      
      // Ensure it's an array
      return Array.isArray(favoritesData) ? favoritesData : [];
    } catch (error) {
      console.error("Error parsing favorites from cookies:", error);
      return [];
    }
  };

  const isFavorite = (productId) => {
    const favorites = getFavorites();
    return favorites.some(fav => String(fav.id) === String(productId));
  };

  const updateFavoritesCache = (favoritesList) => {
    try {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 7);
      
      // Ensure we're setting an array
      const listToCache = Array.isArray(favoritesList) ? favoritesList : [];
      
      setCookie("userFavorites", JSON.stringify(listToCache), {
        expires: expirationDate,
        path: "/",
        secure: process.env.NODE_ENV === 'production',
        sameSite: "lax"
      });
      
    } catch (error) {
    }
  };

  const addToFavoritesCache = (productId) => {
    try {
      const favorites = getFavorites();
      const exists = favorites.some(fav => String(fav.id) === String(productId));
      
      if (!exists) {
        const updatedFavorites = [...favorites, { id: String(productId) }];
        updateFavoritesCache(updatedFavorites);
        return updatedFavorites;
      }
      return favorites;
    } catch (error) {
      return getFavorites();
    }
  };

  const removeFromFavoritesCache = (productId) => {
    try {
      const favorites = getFavorites();
      const updatedFavorites = favorites.filter(fav => String(fav.id) !== String(productId));
      updateFavoritesCache(updatedFavorites);
      return updatedFavorites;
    } catch (error) {
      return getFavorites();
    }
  };

  const rollbackFavoriteAdd = (productId) => {
    try {
      const favorites = getFavorites();
      const updatedFavorites = favorites.filter(fav => String(fav.id) !== String(productId));
      updateFavoritesCache(updatedFavorites);
    } catch (error) {
    }
  };

  const rollbackFavoriteRemove = (productId) => {
    try {
      const favorites = getFavorites();
      const exists = favorites.some(fav => String(fav.id) === String(productId));
      
      if (!exists) {
        const updatedFavorites = [...favorites, { id: String(productId) }];
        updateFavoritesCache(updatedFavorites);
      }
    } catch (error) {
    }
  };

  const clearFavoritesCache = () => {
    try {
      removeCookie("userFavorites", { path: "/" });
    } catch (error) {
    }
  };

  return {
    favorites: getFavorites(),
    isFavorite,
    updateFavoritesCache,
    addToFavoritesCache,
    removeFromFavoritesCache,
    rollbackFavoriteAdd,
    rollbackFavoriteRemove,
    clearFavoritesCache
  };
};

// Utility function to sync favorites between Redux and cookies
export const syncFavoritesWithCookies = (reduxFavorites, updateFavoritesCache) => {
  if (reduxFavorites && reduxFavorites.length >= 0) {
    updateFavoritesCache(reduxFavorites);
  }
};