// getBrandsDataActions.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../Libs/utils/apiutils/apiutils";
import getHttpCodeMessage from "../../../Libs/httpcodes/httpcodes";

// Get all brands
export const getAllBrands = createAsyncThunk(
  "brandsData/getAllBrands",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl("/brands"), {
        method: "GET",
        headers: new Headers({
          "Content-Type": "application/json",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
      
        const error = {
          statusCode: response.status,
          message: errorData?.message || getHttpCodeMessage(response.status),
          type: 'HTTP_ERROR'
        };
      
        return rejectWithValue(error);
      }

      const data = await response.json();
      
      // Check for API-level errors
      if (data.state === "error" || data.success === "false") {
        const error = {
          statusCode: null, // No HTTP error, but API error
          message: data.error || data.message || "خطا در دریافت اطلاعات",
          type: 'API_ERROR',
          apiResponse: data
        };
        return rejectWithValue(error);
      }
      
      return data;
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue({
        statusCode: null,
        message: "خطا در اتصال به سرور",
        type: 'NETWORK_ERROR'
      });
    }
  }
);

// Get single brand by slug
export const getBrandBySlug = createAsyncThunk(
  "brandsData/getBrandBySlug",
  async (slug, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl(`/brandspagedata/${slug}`), {
        method: "GET",
        headers: new Headers({
          "Content-Type": "application/json",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
      
        const error = {
          statusCode: response.status,
          message: errorData?.message || getHttpCodeMessage(response.status),
          type: 'HTTP_ERROR'
        };
      
        return rejectWithValue(error);
      }

      const data = await response.json();
      
      // Check for API-level errors
      if (data.state === "error" || data.success === "false") {
        const error = {
          statusCode: null,
          message: data.error || data.message || "خطا در دریافت اطلاعات برند",
          type: 'API_ERROR',
          apiResponse: data
        };
        return rejectWithValue(error);
      }
      
      return data;
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue({
        statusCode: null,
        message: "خطا در اتصال به سرور",
        type: 'NETWORK_ERROR'
      });
    }
  }
);

// Get brand products
export const getBrandProducts = createAsyncThunk(
  "brandsData/getBrandProducts",
  async ({ slug, page = 1, limit = 20, filters = {} }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });

      const response = await fetch(getApiUrl(`/brands/${slug}/products?${queryParams}`), {
        method: "GET",
        headers: new Headers({
          "Content-Type": "application/json",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
      
        const error = {
          statusCode: response.status,
          message: errorData?.message || getHttpCodeMessage(response.status),
          type: 'HTTP_ERROR'
        };
      
        return rejectWithValue(error);
      }

      const data = await response.json();
      
      // Check for API-level errors
      if (data.state === "error" || data.success === "false") {
        const error = {
          statusCode: null,
          message: data.error || data.message || "خطا در دریافت محصولات برند",
          type: 'API_ERROR',
          apiResponse: data
        };
        return rejectWithValue(error);
      }
      
      return data;
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue({
        statusCode: null,
        message: "خطا در اتصال به سرور",
        type: 'NETWORK_ERROR'
      });
    }
  }
);