import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";

// Action to get user tickets by userId
export const getUserTickets= createAsyncThunk(
  "userTickets/getUserTickets", // Action name
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem("user");

    try {
      const response = await fetch(getApiUrl('/user-myaccounts/user-tickets'), {
        method: "GET",
        headers: new Headers({
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json"
        })
        
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to retrieve user tickets");
      }

      const data = await response.json();
      return data; // Return the fetched user tickets
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);
