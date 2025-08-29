import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";

export const getSubscriptionByUserId = createAsyncThunk(
  "subscription/getSubscriptionByUserId",
  async (_ , { rejectWithValue }) => {

    const token = localStorage.getItem("user");

    try {
      const response = await fetch(getApiUrl(`/user-myaccounts/subscriptions/getsubscriptionbyuserid`), {
        method: "GET",
        headers: new Headers({
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to retrieve subscription");
      }

      const data = await response.json();
      return data; // Returns subscription details
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);
