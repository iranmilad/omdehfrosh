import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";


// Action to get user account details by user ID
export const getUserMyAccount = createAsyncThunk(
  "userMyAccounts/getUserMyAccount",
  async (_, { rejectWithValue }) => {

    const token = localStorage.getItem("user");


    try {
      const response = await fetch(getApiUrl(`/user-myaccounts`), {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        headers: new Headers({
          'Authorization': `Bearer ${token}`, 
          "Content-Type": "application/json"      
        }),         
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to retrieve user account details");
      }

      const data = await response.json();
      return data; // Returns the user account details
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);
