import { createAsyncThunk } from "@reduxjs/toolkit";
import getHttpCodeMessage from "../../../Libs/httpcodes/httpcodes";
import { getApiUrl } from "../../../Libs/utils/apiutils/apiutils";


export const updateFinalReceiptDeleteDiscountCode = createAsyncThunk(
  "cart/updateFinalReceiptDeleteDiscountCode",
  async ({ discountCode }, { rejectWithValue }) => {


    const token = localStorage.getItem("user");


    try {
      const response = await fetch(getApiUrl("/cart/removeDiscount"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        headers: new Headers({
            'Authorization': `Bearer ${token}`, 
            "Content-Type": "application/json"      
          }),      
        body: JSON.stringify({ discountCode }),
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
      return data; // Returns updated final receipt
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);