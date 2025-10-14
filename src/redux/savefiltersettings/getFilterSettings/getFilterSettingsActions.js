import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../Libs/utils/apiutils/apiutils";
import getHttpCodeMessage from "../../../Libs/httpcodes/httpcodes";

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
      
        const error = {
          status: response.status,
          message: errorData?.message || getHttpCodeMessage(response.status),
        };
      
        return rejectWithValue(error);
      }

      const data = await response.json();
      return data?.data || [];
    } catch (error) {
      console.error("Get filter settings error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);
