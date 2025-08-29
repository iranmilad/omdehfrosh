import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../Libs/utils/apiutils/apiutils";

// Async Thunk for verifying the master token
export const verifyMasterToken = createAsyncThunk(
  "authMaster/verifyMasterToken",
  async (_, { rejectWithValue }) => {

    const token = localStorage.getItem("user_master");

    try {


      const response = await fetch(getApiUrl("/auth/verify-token-master"), {
        method: "GET",
        headers: new Headers({
          'Authorization': `Bearer ${token}`, 
          "Content-Type": "application/json"      
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to verify master token");
      }

      const data = await response.json();
      return data; // Returns the response from the server
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);
