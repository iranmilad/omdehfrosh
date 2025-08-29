import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";
import getHttpCodeMessage from "../../../../Libs/httpcodes/httpcodes";

// Example transferData: { recipientPhone: "09365553333", amount: "2424" }
export const transferFromWallet = createAsyncThunk(
  "walletTransfer/transferFromWallet",
  async (transferData, { rejectWithValue }) => {

    


    const token = localStorage.getItem("user");

    try {
      const response = await fetch(getApiUrl("/payment/wallet/transfer"), {
        method: "POST",
        headers: new Headers({
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }),
        body: JSON.stringify(transferData)
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
      return data;
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);
