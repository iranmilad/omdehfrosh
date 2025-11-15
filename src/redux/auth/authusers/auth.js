import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../Libs/utils/apiutils/apiutils";
import getHttpCodeMessage from "../../../Libs/httpcodes/httpcodes";

// Async Thunk for verifying JWT token
export const verifyToken = createAsyncThunk(
    "auth/verifyToken",
    async (_, { rejectWithValue }) => {

      const token = localStorage.getItem("user");

      try {
        const response = await fetch(getApiUrl("/auth/verify-user"), {
          method: "GET",
          headers: new Headers({
            'Authorization': `Bearer ${token}`, 
            "Content-Type": "application/json"      
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
  
        return data;
      } catch (error) {
        console.error("Network error:", error);
        return rejectWithValue("Network error or server not responding");
      }
    }
  );
  
export const verifyTokenSilent = createAsyncThunk(
  'auth/verifyTokenSilent',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("user");
      
      const response = await fetch('/auth/verify-user', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // Return null for failed auth instead of throwing error
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Return null instead of rejecting to prevent console errors
      return null;
    }
  }
);
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isVerified: null, 
    loading: true,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isVerified = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.loading = false;
        state.isVerified = action.payload.valid;  // ✅ Fix this!
        state.user = action.payload.user;  // ✅ Save user data
      })      
      .addCase(verifyToken.rejected, (state, action) => {
        state.loading = false;
        state.isVerified = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
