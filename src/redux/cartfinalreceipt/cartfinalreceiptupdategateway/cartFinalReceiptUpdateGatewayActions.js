import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../Libs/utils/apiutils/apiutils";

export const updateFinalReceiptPaymentMethod = createAsyncThunk(
  "cart/updateFinalReceiptPaymentMethod",
  async ({ paymentMethod }, { rejectWithValue }) => {

    const token = localStorage.getItem("user");

    try {


      const response = await fetch(getApiUrl("/cart/updatefinalreceiptgateway"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        headers: new Headers({
          'Authorization': `Bearer ${token}`, 
          "Content-Type": "application/json"      
        }),
        body: JSON.stringify({ gateway: paymentMethod?.name }), // Backend expects { gateway: name }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to update payment method");
      }

      const data = await response.json();
      return data; // Returns updated payment method
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);
