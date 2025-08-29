// src/redux/savefiltersettings/deleteFilterSettingsActions.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../Libs/utils/apiutils/apiutils";

/**
 * Delete a saved filter by id.
 * If your backend uses a different path (e.g. without `/delete`),
 * change the URL accordingly (e.g. `/save-filters/${slug}/${id}`).
 */
export const deleteFilterSettings = createAsyncThunk(
  "category/deleteFilterSettings",
  async ({ slug, id }, { rejectWithValue }) => {
    const token = localStorage.getItem("user");

    try {
      const url = getApiUrl(`/save-filters/${slug}/delete?id=${id}`);

      const response = await fetch(url, {
        method: "DELETE",
        headers: new Headers({
          "Authorization": `Bearer ${token}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to delete filter");
      }

      return { id };
    } catch (error) {
      console.error("Delete filter error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);
