import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../Libs/utils/apiutils/apiutils";

// Async Thunk to fetch final receipt based on userId
export const fetchFinalReceipt = createAsyncThunk(
  "cart/fetchFinalReceipt",
  async (_, { getState, rejectWithValue }) => {

    const token = localStorage.getItem("user");

    
    try {
      const response = await fetch(getApiUrl("/cart/getfinalreceipt"), {
        method: "GET",
        headers: new Headers({
          'Authorization': `Bearer ${token}`, 
          "Content-Type": "application/json"      
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to fetch receipt");
      }

      const data = await response.json();
      return data; // This will contain totalPriceApply and sellers array
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);

const cartFinalReceiptSlice = createSlice({
  name: "cartfinalreceipt",
  initialState: {
    cartfinalreceipt: [], // Empty array to avoid undefined
    totalfinalreceipt: 0,
    loadingfinalreceipt: false,
    errorfinalreceipt: null,
  },
  reducers: {
    clearCartFinalReceipt: (state) => {
      state.cartfinalreceipt = [];
      state.totalfinalreceipt = 0;
      state.errorfinalreceipt = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFinalReceipt.pending, (state) => {
        state.loadingfinalreceipt = true;
        state.errorfinalreceipt = null;
      })
      .addCase(fetchFinalReceipt.fulfilled, (state, action) => {
        state.loadingfinalreceipt = false;
        state.cartfinalreceipt = action.payload || []; 
        state.totalfinalreceipt = action.payload.totalPriceApply || 0;
      })
      .addCase(fetchFinalReceipt.rejected, (state, action) => {
        state.loadingfinalreceipt = false;
        state.errorfinalreceipt = action.payload;
      });
  },
});

export const { clearCartFinalReceipt } = cartFinalReceiptSlice.actions;
export default cartFinalReceiptSlice.reducer;
