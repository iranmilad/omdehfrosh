import { createSlice } from "@reduxjs/toolkit";
import { 
  batchImportBrandsData, 
  getAllBrandsData, 
  getBrandDataBySlug, 
  updateBrandData, 
  deleteBrandData 
} from "./brandsdataActions";

const brandsdataSlice = createSlice({
  name: "brandsData",
  initialState: {
    brands: [],
    currentBrand: null,
    loading: false,
    error: null,
    successMessage: null, // For success message after operations
    
    // Separate loading states for different operations
    loadingBatchImport: false,
    loadingGetAll: false,
    loadingGetSingle: false,
    loadingUpdate: false,
    loadingDelete: false,
  },
  reducers: {
    // Clear entire state
    clearBrandsDataState: (state) => {
      state.brands = [];
      state.currentBrand = null;
      state.loading = false;
      state.error = null;
      state.successMessage = null;
      state.loadingBatchImport = false;
      state.loadingGetAll = false;
      state.loadingGetSingle = false;
      state.loadingUpdate = false;
      state.loadingDelete = false;
    },
    
    // Clear only current brand
    clearCurrentBrand: (state) => {
      state.currentBrand = null;
      state.loadingGetSingle = false;
    },
    
    // Clear messages
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Batch Import Brands
      .addCase(batchImportBrandsData.pending, (state) => {
        state.loadingBatchImport = true;
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(batchImportBrandsData.fulfilled, (state, action) => {
        state.loadingBatchImport = false;
        state.loading = false;
        state.brands = action.payload.brands || [];
        state.successMessage = action.payload.message || "Brands imported successfully!";
      })
      .addCase(batchImportBrandsData.rejected, (state, action) => {
        state.loadingBatchImport = false;
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get All Brands
      .addCase(getAllBrandsData.pending, (state) => {
        state.loadingGetAll = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllBrandsData.fulfilled, (state, action) => {
        state.loadingGetAll = false;
        state.loading = false;
        state.brands = action.payload.brands || action.payload || [];
      })
      .addCase(getAllBrandsData.rejected, (state, action) => {
        state.loadingGetAll = false;
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Brand by Slug
      .addCase(getBrandDataBySlug.pending, (state) => {
        state.loadingGetSingle = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(getBrandDataBySlug.fulfilled, (state, action) => {
        state.loadingGetSingle = false;
        state.loading = false;
        state.currentBrand = action.payload.brand || action.payload;
      })
      .addCase(getBrandDataBySlug.rejected, (state, action) => {
        state.loadingGetSingle = false;
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Brand
      .addCase(updateBrandData.pending, (state) => {
        state.loadingUpdate = true;
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateBrandData.fulfilled, (state, action) => {
        state.loadingUpdate = false;
        state.loading = false;
        
        // Update the brand in the brands array
        const updatedBrand = action.payload.brand || action.payload;
        const index = state.brands.findIndex(brand => brand.id === updatedBrand.id);
        if (index !== -1) {
          state.brands[index] = updatedBrand;
        }
        
        // Update current brand if it's the same
        if (state.currentBrand && state.currentBrand.id === updatedBrand.id) {
          state.currentBrand = updatedBrand;
        }
        
        state.successMessage = action.payload.message || "Brand updated successfully!";
      })
      .addCase(updateBrandData.rejected, (state, action) => {
        state.loadingUpdate = false;
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Brand
      .addCase(deleteBrandData.pending, (state) => {
        state.loadingDelete = true;
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteBrandData.fulfilled, (state, action) => {
        state.loadingDelete = false;
        state.loading = false;
        
        // Remove the brand from the brands array
        const deletedId = action.payload.id;
        state.brands = state.brands.filter(brand => brand.id !== deletedId);
        
        // Clear current brand if it was the deleted one
        if (state.currentBrand && state.currentBrand.id === deletedId) {
          state.currentBrand = null;
        }
        
        state.successMessage = action.payload.message || "Brand deleted successfully!";
      })
      .addCase(deleteBrandData.rejected, (state, action) => {
        state.loadingDelete = false;
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearBrandsDataState, 
  clearCurrentBrand, 
  clearMessages 
} = brandsdataSlice.actions;

export default brandsdataSlice.reducer;