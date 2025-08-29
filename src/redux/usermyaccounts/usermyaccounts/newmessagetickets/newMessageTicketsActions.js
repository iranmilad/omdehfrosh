import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";
import getHttpCodeMessage from "../../../../Libs/httpcodes/httpcodes";

export const sendTicketMessage = createAsyncThunk(
  "ticket/sendMessage",
  async ({ ticketId, messageText, messageFile }, { rejectWithValue }) => {

    const token = localStorage.getItem("user");


    try {
      const formData = new FormData();
      formData.append("message", messageText);
      if (messageFile) {
        formData.append("file", messageFile);
      }
      
      const response = await fetch(getApiUrl(`/user-myaccounts/user-tickets/messages/newmessage/${ticketId}`), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
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
