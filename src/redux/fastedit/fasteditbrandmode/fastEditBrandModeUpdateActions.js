import { createAsyncThunk } from "@reduxjs/toolkit";

import { useCookies } from "react-cookie";
import { getApiUrl } from "../../../Libs/utils/apiutils/apiutils";
import getHttpCodeMessage from "../../../Libs/httpcodes/httpcodes";

const getTokenFromCookies = () => {
  const cookieString = document.cookie;

  const cookies = cookieString.split("; ").reduce((acc, cookie) => {
    const [name, value] = cookie.split("=");
    acc[name] = decodeURIComponent(value); // Decode in case it's URL-encoded
    return acc;
  }, {});


  return cookies["user"] || null;
};


// Action to update brand mode in fast edit
export const updateFastEditBrandMode = createAsyncThunk(
  "fastEditBrandMode/update",
  async ({ updateData, itemId }, { rejectWithValue }) => {

    // const [cookies] = useCookies(["user"]);
    // const token = cookies; // Get token
    const token = localStorage.getItem("user");


    try {
      const response = await fetch(getApiUrl(`/fastedit/updateproduct`), {
        method: "PUT",
        headers: new Headers({
          'Authorization': `Bearer ${token}`, 
          "Content-Type": "application/json"      
        }), 
        // credentials: "include",
        body: JSON.stringify({updateData: updateData, itemId: itemId}), // Send mode data as body
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



      return data; // Returns the updated brand mode data or success message
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);
