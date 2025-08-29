import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../Libs/utils/apiutils/apiutils";

// Action to fetch all gateways data
export const getAllGateWaysData = createAsyncThunk(
  "gateWaysData/getAll", // Define the action type
  async (state, { rejectWithValue }) => {

    try {
      const response = await fetch(getApiUrl("/gatewaysdata"), {
        method: "POST", // GET request to fetch data
        headers: {
          "Content-Type": "application/json",
        },
        // credentials: 'include',
        body: JSON.stringify(state), // Include the state in the request body
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to fetch gateways data");
      }

      const data = await response.json();
      return data; // Return the fetched gateways data
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);
