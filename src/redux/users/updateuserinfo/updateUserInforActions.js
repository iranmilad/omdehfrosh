import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../Libs/utils/apiutils/apiutils";
import getHttpCodeMessage from "../../../Libs/httpcodes/httpcodes";

export const updateUserInfo = createAsyncThunk(
  "user/updateUserInfo",
  async (userData, { rejectWithValue }) => {

    const token = localStorage.getItem("user");

    try {
      const response = await fetch(getApiUrl("/users/update"), {
        method: "POST",
        headers: new Headers({
          'Authorization': `Bearer ${token}`, 
          "Content-Type": "application/json"      
        }),
        body: JSON.stringify(userData),
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
      return data; // Returns updated user info
    } catch (error) {
      return rejectWithValue("Network error or server not responding");
    }
  }
);
