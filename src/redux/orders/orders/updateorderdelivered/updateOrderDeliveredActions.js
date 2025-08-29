import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";

export const updateOrderDelivered = createAsyncThunk(
  "order/orderStatusUpdate/updateOrderDelivered", // The action name
  async ({ orderId, deliveredStatus }, { rejectWithValue }) => {



    const token = localStorage.getItem("user");


    try {
      const response = await fetch(getApiUrl(`/orders/updateorderstatus/${orderId}`), {
        method: "PUT", // Assuming it's a PATCH request to update status
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ deliveredStatus }), // Send the status as part of the request body
        headers: new Headers({
          'Authorization': `Bearer ${token}`, 
          "Content-Type": "application/json"      
        }), 
        });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to update order delivery status");
      }

      const data = await response.json();
      return data; // Returns the updated order details or status
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);
