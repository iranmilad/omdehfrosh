import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";
import getHttpCodeMessage from "../../../../Libs/httpcodes/httpcodes";

// Example withdrawData: { phone: "09365553333", amount: "2424" }
export const withdrawFromWallet = createAsyncThunk(
  "wallet/withdrawFromWallet",
  async (withdrawData, { rejectWithValue }) => {
    const token = localStorage.getItem("user");

    try {
      const response = await fetch(getApiUrl("/payment/wallet/withdraw"), {
        method: "POST",
        headers: new Headers({
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }),
        body: JSON.stringify(withdrawData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
      
        const error = {
          status: response.status,
          message: errorData?.message || getHttpCodeMessage(response.status),
        };
      
        return rejectWithValue(error);
      }
      const data = await response.json();
      return data; // Return the server response
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);
