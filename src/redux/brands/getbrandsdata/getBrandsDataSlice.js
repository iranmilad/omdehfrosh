// getBrandsDataSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { getAllBrands, getBrandBySlug, getBrandProducts } from "./getBrandsDataActions";

const initialState = {
  brands: [],
  currentBrand: null,
  brandProducts: [],
  isLoading: false,
  error: null,
  errorCode: null, // Store the HTTP status code separately
  errorType: null, // Store error type (HTTP_ERROR, API_ERROR, NETWORK_ERROR)
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 20,
  },
};

const brandsDataSlice = createSlice({
  name: "brandsData",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.errorCode = null;
      state.errorType = null;
    },
    clearCurrentBrand: (state) => {
      state.currentBrand = null;
    },
    clearBrandProducts: (state) => {
      state.brandProducts = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all brands
      .addCase(getAllBrands.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.errorCode = null;
        state.errorType = null;
      })
      .addCase(getAllBrands.fulfilled, (state, action) => {
        state.isLoading = false;
        state.brands = action.payload.data || action.payload;
        state.error = null;
        state.errorCode = null;
        state.errorType = null;
      })
      .addCase(getAllBrands.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || action.payload;
        state.errorCode = action.payload?.statusCode || null;
        state.errorType = action.payload?.type || null;
      })

      // Get brand by slug
      .addCase(getBrandBySlug.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.errorCode = null;
        state.errorType = null;
        state.currentBrand = null;
      })
      .addCase(getBrandBySlug.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBrand = action.payload.data || action.payload;
        state.error = null;
        state.errorCode = null;
        state.errorType = null;
      })
      .addCase(getBrandBySlug.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || action.payload;
        state.errorCode = action.payload?.statusCode || null;
        state.errorType = action.payload?.type || null;
        state.currentBrand = null;
      })

      // Get brand products
      .addCase(getBrandProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.errorCode = null;
        state.errorType = null;
      })
      .addCase(getBrandProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        const payload = action.payload;
        
        if (payload.data) {
          state.brandProducts = payload.data;
          state.pagination = {
            currentPage: payload.currentPage || 1,
            totalPages: payload.totalPages || 0,
            totalItems: payload.totalItems || 0,
            itemsPerPage: payload.itemsPerPage || 20,
          };
        } else {
          state.brandProducts = payload;
        }
        
        state.error = null;
        state.errorCode = null;
        state.errorType = null;
      })
      .addCase(getBrandProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || action.payload;
        state.errorCode = action.payload?.statusCode || null;
        state.errorType = action.payload?.type || null;
        state.brandProducts = [];
      });
  },
});

export const { clearError, clearCurrentBrand, clearBrandProducts } = brandsDataSlice.actions;

export default brandsDataSlice.reducer;