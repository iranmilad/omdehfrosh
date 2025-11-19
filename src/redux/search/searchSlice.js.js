// searchSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { getSearchResults } from "./searchActions.js";

const initialState = {
  results: {
    products: [],
    categories: [],
    brands: []
  },
  currentQuery: "",
  loading: false,
  error: null,
  lastSearchTime: null,
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.results.products = [];
      state.results.categories = [];
      state.results.brands = [];
      state.currentQuery = "";
      state.error = null;
      state.lastSearchTime = null;
    },
    setCurrentQuery: (state, action) => {
      state.currentQuery = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSearchResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSearchResults.fulfilled, (state, action) => {
        console.log('🎯 Search fulfilled with payload:', action.payload);
        
        state.loading = false;
        state.currentQuery = action.payload.query;
        state.lastSearchTime = action.payload.timestamp;
        
        // Get the results array from the payload
        const resultsArray = action.payload.results || [];
        
        console.log('📦 Results array:', resultsArray);
        
        // Initialize with empty arrays
        let products = [];
        let categories = [];
        let brands = [];
        
        // Parse the response structure
        resultsArray.forEach(resultGroup => {
          console.log('🔄 Processing result group:', resultGroup);
          
          if (resultGroup.searchResultName === "product" && Array.isArray(resultGroup.products)) {
            products = resultGroup.products;
            console.log('✅ Found products:', products.length);
          } 
          else if (resultGroup.searchResultName === "category" && Array.isArray(resultGroup.categories)) {
            categories = resultGroup.categories;
            console.log('✅ Found categories:', categories.length);
          } 
          else if (resultGroup.searchResultName === "brand" && Array.isArray(resultGroup.brands)) {
            brands = resultGroup.brands;
            console.log('✅ Found brands:', brands.length);
          }
        });
        
        // Assign all at once - this is the key fix!
        state.results.products = products;
        state.results.categories = categories;
        state.results.brands = brands;
        
        console.log('💾 Final results state:', {
          products: state.results.products.length,
          categories: state.results.categories.length,
          brands: state.results.brands.length
        });
      })
      .addCase(getSearchResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "An error occurred";
        // Keep existing results on error
        console.error('❌ Search rejected:', action.payload);
      });
  },
});

export const { clearSearchResults, setCurrentQuery } = searchSlice.actions;
export default searchSlice.reducer;