import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../Libs/utils/apiutils/apiutils";
import getHttpCodeMessage from "../../../Libs/httpcodes/httpcodes";

export const removeFromFavorites = createAsyncThunk(
  "favorites/removeFromFavorites",
  async (productId, { rejectWithValue }) => {
    const token = localStorage.getItem("user");

    try {
      const response = await fetch(getApiUrl(`/users/removefromfavorites/${productId}`), {
        method: "DELETE",
        headers: new Headers({
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue({
          status: response.status,
          message: errorData?.message || getHttpCodeMessage(response.status),
        });
      }

      const data = await response.json();
      return data; // Expecting true or false
    } catch (error) {
      return rejectWithValue("Network error or server not responding");
    }
  }
);
