import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../Libs/utils/apiutils/apiutils";

// Async Thunk to fetch user info
export const fetchUserInfo = createAsyncThunk(
  "user/fetchUserInfo",
  async (_, { rejectWithValue }) => {

    const token = localStorage.getItem("user");

    try {
      const response = await fetch(getApiUrl("/users/getuserinfo"), {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        headers: new Headers({
          'Authorization': `Bearer ${token}`, 
          "Content-Type": "application/json"      
        }),          
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to fetch user info");
      }

      const data = await response.json();
      return data; // This will contain user information
    } catch (error) {
      return rejectWithValue("Network error or server not responding");
    }
  }
);

const userInfoSlice = createSlice({
  name: "user",
  initialState: {
    userInfo: null, // Store user info object
    loadingUserInfo: false,
    errorUserInfo: null,
  },
  reducers: {
    clearUserInfo: (state) => {
      state.userInfo = null;
      state.errorUserInfo = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserInfo.pending, (state) => {
        state.loadingUserInfo = true;
        state.errorUserInfo = null;
      })
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        state.loadingUserInfo = false;
        state.userInfo = action.payload || null;
      })
      .addCase(fetchUserInfo.rejected, (state, action) => {
        state.loadingUserInfo = false;
        state.errorUserInfo = action.payload;
      });
  },
});

export const { clearUserInfo } = userInfoSlice.actions;
export default userInfoSlice.reducer;
