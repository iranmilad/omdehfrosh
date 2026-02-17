import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../Libs/utils/apiutils/apiutils";

export const getSellerComments = createAsyncThunk(
  "sellerComments/getSellerComments",
  async (sellerId, { rejectWithValue }) => {
    if (!sellerId) {
      return rejectWithValue("Seller ID is required");
    }

    const id = String(sellerId);

    try {
      const response = await fetch(getApiUrl(`/seller/${id}/comments`), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(
          errorData?.message || "Failed to retrieve seller comments"
        );
      }

      const json = await response.json();
      return json.data ?? json;
    } catch (error) {
      console.error("Seller comments fetch error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);
