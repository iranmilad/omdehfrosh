import { createSlice } from "@reduxjs/toolkit";
import { fetchbrandProductsData, fetchFilterOptions, searchProducts } from './brandProductsActions'


const brandProductsSlice = createSlice({
  name: "brandProducts",
  initialState: {
    // brandProducts data
    products: [],
    totalPages: 0,
    currentPage: 1,
    totalProducts: 0,
    price: { min: 0, max: 0 },
    filters: [],
    
    // Loading states
    loading: false,
    searchLoading: false,
    filterOptionsLoading: false,
    
    // Error states
    error: null,
    searchError: null,
    filterOptionsError: null,
    
    // Current filter values
    currentFilters: {
      page: 1,
      limit: 20,
      sort: "newest",
      brand: null,
      colors: [],
      delivery_areas: [],
      price_min: 0,
      price_max: 0,
      s: "", // search term
    },
    
    // UI state
    sortValue: "newest",
    searchTerm: "",
  },
  reducers: {
    // Clear all state
    clearbrandProductsState: (state) => {
      state.products = [];
      state.totalPages = 0;
      state.currentPage = 1;
      state.totalProducts = 0;
      state.error = null;
      state.searchError = null;
    },
    
    // Update current filters
    updateFilters: (state, action) => {
      state.currentFilters = {
        ...state.currentFilters,
        ...action.payload,
      };
    },
    
    // Update individual filter
    updateFilter: (state, action) => {
      const { key, value } = action.payload;
      state.currentFilters[key] = value;
    },
    
    // Update page
    updatePage: (state, action) => {
      state.currentFilters.page = action.payload;
      state.currentPage = action.payload;
    },
    
    // Update sort
    updateSort: (state, action) => {
      state.currentFilters.sort = action.payload;
      state.sortValue = action.payload;
      state.currentFilters.page = 1; // Reset to first page
      state.currentPage = 1;
    },
    
    // Update search term
    updateSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      state.currentFilters.s = action.payload;
      state.currentFilters.page = 1; // Reset to first page
      state.currentPage = 1;
    },
    
    // Update price range
    updatePriceRange: (state, action) => {
      const { min, max } = action.payload;
      state.currentFilters.price_min = min;
      state.currentFilters.price_max = max;
      state.currentFilters.page = 1; // Reset to first page
      state.currentPage = 1;
    },
    
    // Update dynamic filter (brands, colors, delivery_areas)
    updateDynamicFilter: (state, action) => {
      const { key, value } = action.payload;
      state.currentFilters[key] = value;
      state.currentFilters.page = 1; // Reset to first page
      state.currentPage = 1;
    },
    
    // Clear specific error
    clearError: (state, action) => {
      const errorType = action.payload; // 'error', 'searchError', 'filterOptionsError'
      if (errorType && state[errorType]) {
        state[errorType] = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch brandProducts Data
      .addCase(fetchbrandProductsData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchbrandProductsData.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.totalProducts = action.payload.totalProducts;
        state.price = action.payload.price;
        state.filters = action.payload.filters;
      })
      .addCase(fetchbrandProductsData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

 
  },
});

export const {
  clearbrandProductsState,
  updateFilters,
  updateFilter,
  updatePage,
  updateSort,
  updateSearchTerm,
  updatePriceRange,
  updateDynamicFilter,
  clearError,
} = brandProductsSlice.actions;

export default brandProductsSlice.reducer;