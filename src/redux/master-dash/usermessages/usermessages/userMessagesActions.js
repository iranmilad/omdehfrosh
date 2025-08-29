import { createAsyncThunk } from "@reduxjs/toolkit";
import Cookies from "js-cookie"; // Import js-cookie to get token
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";

// Action to batch import user messages
export const batchImportUserMessages = createAsyncThunk(
  "userMessages/batchImport",
  async ({ messages }, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl("/master-dash/user-messages/batch-import"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ messages }), // Send messages array as body
      });

      // message type for 400 500 responses
      // 401 => login page
      // integrated meessgaes

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to batch import user messages");
      }

      const data = await response.json();
      return data; // Returns the imported messages or a success message
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);
