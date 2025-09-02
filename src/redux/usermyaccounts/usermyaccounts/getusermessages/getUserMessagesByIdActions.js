import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";

// Action to get user messages by userId
export const getUserMessagesById = createAsyncThunk(
  "userMessages/getUserMessagesById", // Action name
  async (_, { rejectWithValue }) => {

    const token = localStorage.getItem("user");

    try {

      const response = await fetch(getApiUrl('/user-myaccounts/user-messages'), {
        method: "GET",
        headers: new Headers({
          'Authorization': `Bearer ${token}`, 
          "Content-Type": "application/json"      
        }),         
        // credentials: "include", // Optional, if you are using cookies for auth
      });


      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to retrieve user messages");
      }

      const data = await response.json();
      return data; // Return the fetched user messages
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);
