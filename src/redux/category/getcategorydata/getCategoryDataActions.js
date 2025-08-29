import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../Libs/utils/apiutils/apiutils";

export const getCategoryData = createAsyncThunk(
  "category/getCategoryData",
  async ({slug, filters}, { rejectWithValue }) => {

    const token = localStorage.getItem("user");

    try {
      const response = await fetch(getApiUrl(`/category/${slug}`), {
        method: "POST",
        headers: new Headers({
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({filters: filters})
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to fetch category data");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);
