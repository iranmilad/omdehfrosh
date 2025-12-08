// src/redux/orders/updateOrderAddress/updateOrderAddressActions.js

import { createAsyncThunk } from "@reduxjs/toolkit";
import getHttpCodeMessage from "../../../Libs/httpcodes/httpcodes";
import { getApiUrl } from "../../../Libs/utils/apiutils/apiutils";

// Update single order address
export const updateOrderAddress = createAsyncThunk(
  "orders/updateOrderAddress",
  async ({ orderId, address }, { rejectWithValue }) => {
    const token = localStorage.getItem("user");

    try {
      const response = await fetch(getApiUrl(`/orders/updateaddress/${orderId}`), {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address }),
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
      return data;
    } catch (error) {
      console.error("Update order address error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);

// NEW: Update all basket orders address
export const updateBasketOrdersAddress = createAsyncThunk(
  "orders/updateBasketOrdersAddress",
  async ({ address }, { rejectWithValue }) => {
    const token = localStorage.getItem("user");

    try {
      const response = await fetch(getApiUrl(`/orders/updatebasketaddress`), {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address }),
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
      return data;
    } catch (error) {
      console.error("Update basket orders address error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);