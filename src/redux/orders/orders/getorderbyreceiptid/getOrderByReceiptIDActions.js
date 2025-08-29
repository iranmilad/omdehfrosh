import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";

export const getOrderByReceiptID = createAsyncThunk(
  "order/getOrderByReceiptID",
  async ({ receipt_id }, { rejectWithValue }) => {

    const token = localStorage.getItem("user");


    try {
      const response = await fetch(getApiUrl(`/orders/getorderbyreceiptid/${receipt_id}`), {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        headers: new Headers({
          'Authorization': `Bearer ${token}`, 
          "Content-Type": "application/json"      
        }), 
        });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to retrieve order details");
      }

      const data = await response.json();
      return data; // Returns order details
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);
