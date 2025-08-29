// priceListsActions.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import { getApiUrl } from '../../Libs/utils/apiutils/apiutils';

export const fetchPriceLists = createAsyncThunk(
  'priceLists/fetchAll',
  async (token, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl("/homepage/getallpricelist"), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch prices");

      const data = await response.json();
      return data;
    } catch (err) {
      console.error("Error fetching price lists:", err);
      return rejectWithValue(err.message || "Unexpected error");
    }
  }
);
