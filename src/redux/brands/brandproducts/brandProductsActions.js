import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../Libs/utils/apiutils/apiutils";
import getHttpCodeMessage from "../../../Libs/httpcodes/httpcodes";

// Fetch brandProducts data with filters. Optional apiPath (e.g. /seller/:id/products) overrides default endpoint.
export const fetchbrandProductsData = createAsyncThunk(
  "brandProducts/fetchbrandProductsData",
  async (arg, { rejectWithValue }) => {
    const { filters, apiPath } = typeof arg?.filters !== "undefined"
      ? { filters: arg.filters, apiPath: arg.apiPath ?? null }
      : { filters: arg, apiPath: null };
    const endpoint = apiPath || "/brands/brandproducts";
    try {
      const response = await fetch(getApiUrl(endpoint), {
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

