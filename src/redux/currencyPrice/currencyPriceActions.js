import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../Libs/utils/apiutils/apiutils";
import getHttpCodeMessage from "../../Libs/httpcodes/httpcodes";

/**
 * Update currency price
 * @param {Object} params - Contains price and currency
 * @param {number} params.price - The currency price value
 * @param {string} params.currency - Currency code (USD, EUR, etc.)
 */
export const updateCurrencyPrice = createAsyncThunk(
  "currencyPrice/update",
  async ({ price, currency = "USD" }, { rejectWithValue }) => {
    const token = localStorage.getItem("user");

    if (!token) {
      return rejectWithValue({
        status: 401,
        message: "توکن یافت نشد. لطفا وارد شوید"
      });
    }

    try {
      const response = await fetch(getApiUrl("/currency-price/update"), {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`, 
          "Content-Type": "application/json"      
        },         
        body: JSON.stringify({ price, currency }),
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
      console.error("Network error in updateCurrencyPrice:", error);
      return rejectWithValue({
        status: 500,
        message: "خطای شبکه یا عدم پاسخ سرور"
      });
    }
  }
);

/**
 * Get currency price from database
 * Fetches the user's last saved currency price
 */
export const getCurrencyPrice = createAsyncThunk(
  "currencyPrice/get",
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem("user");

    if (!token) {
      return rejectWithValue({
        status: 401,
        message: "توکن یافت نشد. لطفا وارد شوید"
      });
    }

    try {
      const response = await fetch(getApiUrl("/currency-price/get"), {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`, 
          "Content-Type": "application/json"      
        },
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
      console.error("Network error in getCurrencyPrice:", error);
      return rejectWithValue({
        status: 500,
        message: "خطای شبکه یا عدم پاسخ سرور"
      });
    }
  }
);

/**
 * Delete currency price
 * Soft deletes the currency price by setting isActive to false
 */
export const deleteCurrencyPrice = createAsyncThunk(
  "currencyPrice/delete",
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem("user");

    if (!token) {
      return rejectWithValue({
        status: 401,
        message: "توکن یافت نشد. لطفا وارد شوید"
      });
    }

    try {
      const response = await fetch(getApiUrl("/currency-price/delete"), {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`, 
          "Content-Type": "application/json"      
        },
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
      console.error("Network error in deleteCurrencyPrice:", error);
      return rejectWithValue({
        status: 500,
        message: "خطای شبکه یا عدم پاسخ سرور"
      });
    }
  }
);