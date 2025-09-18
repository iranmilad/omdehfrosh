import { createAsyncThunk } from "@reduxjs/toolkit";
import getHttpCodeMessage from "../../Libs/httpcodes/httpcodes";
import { getApiUrl } from "../../Libs/utils/apiutils/apiutils";

export const fetchShopHomeData = createAsyncThunk(
  "shopHome/fetchShopHomeData",
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem("user");

    try {
      const response = await fetch(getApiUrl("/homepage/homepagedata"), {
        method: "GET",
        headers: new Headers({
          'Authorization': `Bearer ${token}`, 
          "Content-Type": "application/json"      
        }),      
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = {
          status: response.status,
          message: errorData?.message || getHttpCodeMessage(response.status),
        };
        return rejectWithValue(error);
      }

      const result = await response.json();
      return result; // This should return { message: "ok", data: [...] }

    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);