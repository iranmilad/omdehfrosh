import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../Libs/utils/apiutils/apiutils";
import getHttpCodeMessage from "../../../Libs/httpcodes/httpcodes";

export const requestFinalReceipt = createAsyncThunk(
  "cart/requestFinalReceipt",
  async ({ receipt_id_seller, receipt_id, vatRequested }, { rejectWithValue }) => {
    const token = localStorage.getItem("user");

    try {
      const response = await fetch(getApiUrl(`/cart/requestfinalreceipt/${receipt_id}`), {
        method: "POST",
        headers: new Headers({
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ vatRequested, receipt_id_seller }),
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
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);
