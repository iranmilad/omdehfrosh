import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";



// Action to get subscription plans
export const getsubscriptionPlansGet = createAsyncThunk(
  "subscriptionPlans/getSubscriptionPlans", // Action name
  async (_, { rejectWithValue }) => {


    const token = localStorage.getItem("user");

    try {
      const response = await fetch(getApiUrl('/user-myaccounts/allsubscriptionplans'), {
        method: "GET",
        headers: new Headers({
          'Authorization': `Bearer ${token}`, 
          "Content-Type": "application/json"      
        }),     
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to retrieve subscription plans");
      }

      const data = await response.json();
      return data; // Return the fetched subscription plans
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);
