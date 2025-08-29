// src/store/category/slices/updateFilterSettingsActions.js

import { createAsyncThunk } from "@reduxjs/toolkit";
import getHttpCodeMessage from "../../../Libs/httpcodes/httpcodes";
import { getApiUrl } from "../../../Libs/utils/apiutils/apiutils";

export const updateFilterSettings = createAsyncThunk(
  "category/updateFilterSettings",
  async ({ slug, ...payload }, { rejectWithValue }) => {
    const token = localStorage.getItem("user");

    
    try {
      const response = await fetch(getApiUrl(`/save-filters/${slug}/update`), {
        method: "PUT",
        headers: new Headers({
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(payload),
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
      console.error("Update filter error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);
