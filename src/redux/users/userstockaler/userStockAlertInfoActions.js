import { createAsyncThunk } from "@reduxjs/toolkit";
import getHttpCodeMessage from "../../../Libs/httpcodes/httpcodes";
import { getApiUrl } from "../../../Libs/utils/apiutils/apiutils";

// Get user stock alert info
export const getUserStockAlertInfo = createAsyncThunk(
  "stockAlert/getUserStockAlertInfo",
  async (product_id, { rejectWithValue }) => {
    const token = localStorage.getItem("user");


    try {
      
      const response = await fetch(getApiUrl(`/users/userstockalertinfoget/${product_id}`), {
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
      return rejectWithValue({
        status: 0,
        message: "خطا در اتصال به سرور"
      });
    }
  }
);

// Set user stock alert info
export const setUserStockAlertInfo = createAsyncThunk(
  "stockAlert/setUserStockAlertInfo",
  async (alertInfo, { rejectWithValue }) => {
    const token = localStorage.getItem("user");


    try {
      
      const response = await fetch(getApiUrl("/users/userstockalertinfoset"), {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`, 
          "Content-Type": "application/json"      
        },  
        body: JSON.stringify(alertInfo),
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
      return rejectWithValue({
        status: 0,
        message: "خطا در اتصال به سرور"
      });
    }
  }
);

// Remove user stock alert info
export const removeUserStockAlertInfo = createAsyncThunk(
  "stockAlert/removeUserStockAlertInfo",
  async (product_id, { rejectWithValue }) => {
    const token = localStorage.getItem("user");



    try {
      
      const response = await fetch(getApiUrl(`/users/userstockalertinforemove/${product_id}`), {
        method: "DELETE", // CHANGED: Should be DELETE instead of GET
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
      return rejectWithValue({
        status: 0,
        message: "خطا در اتصال به سرور"
      });
    }
  }
);