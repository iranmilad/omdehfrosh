import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../Libs/utils/apiutils/apiutils";
import getHttpCodeMessage from "../../../Libs/httpcodes/httpcodes";

export const addedToFavorites = createAsyncThunk(
  "favorites/addedToFavorites",
  async (productId, { rejectWithValue }) => {
    const token = localStorage.getItem("user");

    try {
      const response = await fetch(getApiUrl(`/users/addedtofavorites/${productId}`), {
        method: "GET",
        headers: new Headers({
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        const error = {
          status: response.status,
          message: errorData?.message || getHttpCodeMessage(response.status),
        };

        return rejectWithValue(error);
      }

      const data = await response.json();
      
      // Return the isFavorite boolean from the API response
      return data?.isFavorite; // Changed from data?.success to data?.isFavorite
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);