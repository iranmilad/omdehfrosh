import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../Libs/utils/apiutils/apiutils";

export const verifyPayment = createAsyncThunk(
  "payment/verifyPayment",


  async ({ receiptId }, { rejectWithValue }) => {

    

    try {

      const response = await fetch(getApiUrl("/payment/checkpaymentstatus"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiptId }),
      });

      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Payment verification failed");
      }

      const data = await response.json();
      return data; // Returns the verification result
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);
