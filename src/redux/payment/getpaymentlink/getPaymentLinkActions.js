import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../Libs/utils/apiutils/apiutils";

export const getPaymentLink = createAsyncThunk(
  "payment/getPaymentLink",
  async ({ cartfinalreceipt }, { rejectWithValue }) => {

    const token = localStorage.getItem("user");

    try {
      const response = await fetch(getApiUrl("/payment/getpaymentlink"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        headers: new Headers({
          'Authorization': `Bearer ${token}`, 
          "Content-Type": "application/json"      
        }),         
        body: JSON.stringify({
          receipt_id: cartfinalreceipt.receipt_id, 
          reference_cart_id: cartfinalreceipt.reference_cart_id

        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to retrieve payment link");
      }

      const data = await response.json();
      return data; // Returns the payment link
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);
