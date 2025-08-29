import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../../Libs/utils/apiutils/apiutils";

export const getProductComments = createAsyncThunk(
  "productComments/getProductComments",
  async (params, { rejectWithValue }) => {
    const token = localStorage.getItem("user");
    
    // Handle both id and productId parameters
    const { id, productId } = params;
    const requestId = id || productId;
    
    if (!requestId) {
      return rejectWithValue("Product ID is required");
    }

    // Ensure ID is always sent as string
    const stringId = String(requestId);

    try {
      const response = await fetch(getApiUrl(`/singleproduct/getproductcomments`), {
        method: "POST",
        body: JSON.stringify({ productId: stringId }),
        headers: new Headers({
          'Authorization': `Bearer ${token}`, 
          "Content-Type": "application/json"      
        }), 
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to retrieve product comments");
      }

      const data = await response.json();
      return data; // Returns product comments
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);