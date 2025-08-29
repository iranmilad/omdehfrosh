import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";

export const getPaymentLinkWallet = createAsyncThunk(
  "wallet/getPaymentLinkWallet",
  async ({ depositData }, { rejectWithValue }) => {
    const token = localStorage.getItem("user");

    try {
      const response = await fetch(getApiUrl("/payment/wallet/getpaymentlink"), {
        method: "POST",
        headers: new Headers({
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({
          depositData
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to retrieve wallet payment link");
      }

      const data = await response.json();
      return data; // Return the wallet payment link
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);
