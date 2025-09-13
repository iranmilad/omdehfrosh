import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../../Libs/utils/apiutils/apiutils";
import getHttpCodeMessage from "../../../../../Libs/httpcodes/httpcodes";

// Action to get subscription info by modelId
export const getSubscriptionInfoByModelId = createAsyncThunk(
  "subscriptions/getSubscriptionInfo",
  async ({ modelId }, { rejectWithValue }) => {
    const token = localStorage.getItem("user");

    try {
      const response = await fetch(
        getApiUrl(`/user-myaccounts/subscriptions/info/${modelId}`),
        {
          method: "GET",
          headers: new Headers({
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        const error = {
          status: response.status,
          message: errorData?.message || getHttpCodeMessage(response.status),
        };

        return rejectWithValue(error);
      }

      const data = await response.json();
      return data; // Subscription info response
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);
