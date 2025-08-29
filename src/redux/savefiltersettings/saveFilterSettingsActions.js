import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../Libs/utils/apiutils/apiutils";

export const saveFilterSettings = createAsyncThunk(
  "category/saveFilterSettings",
  async ({ slug, filters, filterName }, { rejectWithValue }) => {
    const token = localStorage.getItem("user");

    try {
      const response = await fetch(getApiUrl(`/save-filters/${slug}/create`), {
        method: "POST",
        headers: new Headers({
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ 
          ...filters, 
          filterName // Include filterName in the request body
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
      return data;
    } catch (error) {
      console.error("Save filter error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);