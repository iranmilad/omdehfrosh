import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../Libs/utils/apiutils/apiutils";

export const getFilterSettings = createAsyncThunk(
  "category/getFilterSettings",
  async (slug, { rejectWithValue }) => {
    const token = localStorage.getItem("user");

    try {
      const response = await fetch(getApiUrl(`/save-filters/${slug}`), {
        method: "GET",
        headers: new Headers({
          Authorization: `Bearer ${token}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to fetch filters");
      }

      const data = await response.json();
      return data?.data || [];
    } catch (error) {
      console.error("Get filter settings error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);
