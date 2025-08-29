import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../Libs/utils/apiutils/apiutils";
import getHttpCodeMessage from "../../../Libs/httpcodes/httpcodes";

// Fetch cart data
export const fetchCartData = createAsyncThunk(
  "cart/fetchCartData",
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem("user");

    if (!token) {
      return rejectWithValue({
        status: 401,
        message: "No authentication token found"
      });
    }

    try {
      const response = await fetch(getApiUrl("/cart"), {
        method: "GET",
        headers: new Headers({
          'Authorization': `Bearer ${token}`, 
          "Content-Type": "application/json"      
        }),        
      });

      if (!response.ok) {
        // Handle 429 specifically
        if (response.status === 429) {
          const errorData = await response.json().catch(() => ({}));
          return rejectWithValue({
            status: 429,
            message: errorData?.message || "Too many requests, please try again later",
            retryAfter: response.headers.get('Retry-After') || 60
          });
        }

        // Handle 401 - remove invalid token
        if (response.status === 401) {
          localStorage.removeItem("user");
        }

        const errorData = await response.json().catch(() => ({}));
        
        const error = {
          status: response.status,
          message: errorData?.message || getHttpCodeMessage(response.status),
        };
        
        return rejectWithValue(error);
      }
      
      const serverData = await response.json();
      
      return {
        message: "ok",
        cart: serverData.cart || [],
        totalPrice: serverData.total || 0
      };
    } catch (error) {
      console.error("Cart fetch network error:", error);
      return rejectWithValue({
        status: 0,
        message: "Network error or server not responding"
      });
    }
  }
);

// Update cart item quantity
export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async ({ productId, combinationsID, sellerId, quantity }, { rejectWithValue }) => {
    const token = localStorage.getItem("user");

    if (!token) {
      return rejectWithValue({
        status: 401,
        message: "No authentication token found"
      });
    }

    try {
      const response = await fetch(getApiUrl("/cart/update"), {
        method: "POST",
        headers: new Headers({
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ 
          productId, 
          combinationsID, 
          sellerId, 
          quantity 
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          const errorData = await response.json().catch(() => ({}));
          return rejectWithValue({
            status: 429,
            message: errorData?.message || "Too many requests, please try again later",
            retryAfter: response.headers.get('Retry-After') || 60
          });
        }

        if (response.status === 401) {
          localStorage.removeItem("user");
        }

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
      console.error("Cart update network error:", error);
      return rejectWithValue({
        status: 0,
        message: "Network error or server not responding"
      });
    }
  }
);

// Remove item from cart
export const removeCartItem = createAsyncThunk(
  "cart/removeCartItem",
  async ({ productId, combinationsID, sellerId }, { rejectWithValue }) => {
    const token = localStorage.getItem("user");

    if (!token) {
      return rejectWithValue({
        status: 401,
        message: "No authentication token found"
      });
    }

    try {
      const response = await fetch(getApiUrl("/cart/remove"), {
        method: "POST",
        headers: new Headers({
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ 
          productId, 
          combinationsID, 
          sellerId 
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          const errorData = await response.json().catch(() => ({}));
          return rejectWithValue({
            status: 429,
            message: errorData?.message || "Too many requests, please try again later",
            retryAfter: response.headers.get('Retry-After') || 60
          });
        }

        if (response.status === 401) {
          localStorage.removeItem("user");
        }

        const errorData = await response.json().catch(() => ({}));
        
        const error = {
          status: response.status,
          message: errorData?.message || getHttpCodeMessage(response.status),
        };
        
        return rejectWithValue(error);
      }

      const data = await response.json();
      return { productId, combinationsID, sellerId, ...data };
    } catch (error) {
      console.error("Cart remove network error:", error);
      return rejectWithValue({
        status: 0,
        message: "Network error or server not responding"
      });
    }
  }
);