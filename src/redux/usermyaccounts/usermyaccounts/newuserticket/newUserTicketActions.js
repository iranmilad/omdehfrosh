import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";
import getHttpCodeMessage from "../../../../Libs/httpcodes/httpcodes";

export const createNewUserTicket = createAsyncThunk(
  "userTickets/createNewUserTicket",
  async ({ title, department, departmentLabel, description, ticketShortDesc }, { rejectWithValue }) => {

    const token = localStorage.getItem("user");

    try {
      const response = await fetch(getApiUrl("/user-myaccounts/user-tickets/create"), {
        method: "POST",
        headers: new Headers({
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ 
          title, 
          department, 
          departmentLabel, // Include department label
          description, 
          ticketShortDesc 
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

      const data = await response.json();
      return data; // Returns the created ticket data
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);