import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";

export const verifyPaymentWallet = createAsyncThunk(
  "wallet/verifyPaymentWallet",
  async ({ order_id }, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl("/payment/wallet/checkpaymentstatus"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Wallet payment verification failed");
      }

      const data = await response.json();
      return data; // Returns the wallet payment verification result
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);
