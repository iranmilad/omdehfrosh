import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../Libs/utils/apiutils/apiutils";
import getHttpCodeMessage from "../../../Libs/httpcodes/httpcodes";

// Fetch brandProducts data with filters
export const fetchbrandProductsData = createAsyncThunk(
  "brandProducts/fetchbrandProductsData",
  async (filters, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl("/brands/brandproducts"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filters),
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
      return data.data; // Return the data object from the response
    } catch (error) {
      console.error("brandProducts fetch error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);

