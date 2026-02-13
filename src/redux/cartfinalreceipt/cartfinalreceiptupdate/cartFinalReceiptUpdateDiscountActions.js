import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../Libs/utils/apiutils/apiutils";
import getHttpCodeMessage from "../../../Libs/httpcodes/httpcodes";

export const updateFinalReceiptWithDiscount = createAsyncThunk(
  "cart/updateFinalReceiptWithDiscount",
  async ({ discountCode }, { rejectWithValue }) => {

    const token = localStorage.getItem("user");


    try {
      const response = await fetch(getApiUrl("/cart/updatefinalreceipt"), {
        method: "POST",
        headers: new Headers({
          'Authorization': `Bearer ${token}`, 
          "Content-Type": "application/json"      
        }),         
        body: JSON.stringify({ discountCode }), // Send both discount code and payment method
      });

      if (!response.ok) {
        if (response.status === 401 && typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("auth:401"));
        }
        const errorData = await response.json().catch(() => ({}));
        const error = {
          status: response.status,
          message: errorData?.message || getHttpCodeMessage(response.status),
          errors: errorData?.errors, // Preserve errors object (e.g. errors.code)
          state: errorData?.state, // Preserve state if present
        };
        return rejectWithValue(error);
      }
      
      const data = await response.json();
      return data; // Returns updated final receipt
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);


