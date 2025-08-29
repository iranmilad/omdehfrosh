import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../Libs/utils/apiutils/apiutils";

// Action to batch import brands data
export const batchImportBrandsData = createAsyncThunk(
  "brandsData/batchImport",
  async ({ brandsData }, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl("/master-dash/brandsdata/batch-import"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ brandsData }), // Send brands array as body
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to batch import brands");
      }

      const data = await response.json();
      return data; // Returns the imported brands or a success message
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);

// Action to get all brands data
export const getAllBrandsData = createAsyncThunk(
  "brandsData/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl("/master-dash/brands"), {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to fetch brands");
      }

      const data = await response.json();
      return data; // Returns the brands array
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);

// Action to get single brand by slug
export const getBrandDataBySlug = createAsyncThunk(
  "brandsData/getBySlug",
  async (slug, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl(`/master-dash/brands/${slug}`), {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Brand not found");
      }

      const data = await response.json();
      return data; // Returns the single brand data
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);

// Action to update brand data
export const updateBrandData = createAsyncThunk(
  "brandsData/update",
  async ({ id, brandData }, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl(`/master-dash/brands/${id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(brandData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to update brand");
      }

      const data = await response.json();
      return data; // Returns the updated brand data
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);

// Action to delete brand
export const deleteBrandData = createAsyncThunk(
  "brandsData/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl(`/master-dash/brands/${id}`), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData?.message || "Failed to delete brand");
      }

      const data = await response.json();
      return { id, ...data }; // Returns the deleted brand id and response
    } catch (error) {
      console.error("Network error:", error);
      return rejectWithValue("Network error or server not responding");
    }
  }
);