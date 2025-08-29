// getAllOrdersByUserIdActions.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";

export const getAllOrdersByUserId = createAsyncThunk(
  "orders/getAllOrdersByUserId",
  async (_, { rejectWithValue }) => {

    const token = localStorage.getItem("user");

    try {
      const response = await fetch(getApiUrl(`/orders/allordersbyuserid`), {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        headers: new Headers({
          'Authorization': `Bearer ${token}`, 
          "Content-Type": "application/json"      
        }), 
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to retrieve orders");
      }

      const data = await response.json();
      return data; // Returns orders list
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);