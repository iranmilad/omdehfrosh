import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../Libs/utils/apiutils/apiutils";

export const verifyPayment = createAsyncThunk(
  "payment/verifyPayment",
  async ({order_id}, { rejectWithValue }) => {
    try {
      // Since you're using params in the URL, you don't need a POST body
      // Or if you want to keep POST, send a proper object
      const response = await fetch(getApiUrl(`/payment/checkpaymentstatus/${order_id}`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Remove body since you're using params, or send proper JSON:
        // body: JSON.stringify({ order_id: receiptId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Payment verification failed");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);

// Alternative version if you want to use POST body instead of URL params:
export const verifyPaymentWithBody = createAsyncThunk(
  "payment/verifyPaymentWithBody",
  async ({ receiptId }, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl("/payment/checkpaymentstatus"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: receiptId }), // Send as object property
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Payment verification failed");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);