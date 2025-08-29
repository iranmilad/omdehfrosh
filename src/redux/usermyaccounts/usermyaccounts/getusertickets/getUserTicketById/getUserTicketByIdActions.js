import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../../Libs/utils/apiutils/apiutils";

// Action to fetch a user ticket by ticketId
export const getUserTicketById = createAsyncThunk(
  "userTicket/getUserTicketById",
  async ({ id }, { rejectWithValue }) => {


    const token = localStorage.getItem("user");

    try {
      const response = await fetch(getApiUrl(`/user-myaccounts/user-tickets/${id}`), {
        method: "GET",
        headers: new Headers({
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json"
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to retrieve ticket details");
      }

      const data = await response.json();
      return data; // Return ticket details
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);
