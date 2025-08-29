import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../Libs/utils/apiutils/apiutils";
import getHttpCodeMessage from "../../../Libs/httpcodes/httpcodes";



export const getUserFavoritesList = createAsyncThunk(
  "favorites/getUserFavoritesList",
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem("user");

    try {
      const response = await fetch(getApiUrl(`/users/favorites`), {
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
      
      // Return the favorites array from the API response
      return data?.favorites || [];
    } catch (error) {
      return rejectWithValue("Network error or server not responding");
    }
  }
);