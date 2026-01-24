import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../Libs/utils/apiutils/apiutils";

export const getCompareListData = createAsyncThunk(
  "compare/getCompareList",
  async (itemIds, { rejectWithValue }) => {
    const token = localStorage.getItem("user");

    try {
      const response = await fetch(getApiUrl("/comparelist"), {
        method: "POST",
        headers: new Headers({
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({ items: { itemIds: itemIds } }) // Backend expects { items: { itemIds: [...] } }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to fetch compare list");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);
