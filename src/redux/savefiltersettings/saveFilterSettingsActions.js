import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../Libs/utils/apiutils/apiutils";

/**
 * Normalize category uniqueIDClickedSubCategoriesBrands for backend.
 * Backend expects idBrands as [{ idSubCategory, idBrands: [string] }];
 * frontend may send idBrands as [string] with idSubCategory at entry level.
 */
function normalizeCategorySubCategoriesBrands(items) {
  if (!Array.isArray(items)) return [];
  return items.map((entry) => {
    if (!entry) return { idSubCategories: [], idBrands: [] };
    const idBrandsRaw = entry.idBrands;
    if (!Array.isArray(idBrandsRaw)) return { idSubCategories: [], idBrands: [] };
    const isBackendShape =
      idBrandsRaw.length > 0 &&
      typeof idBrandsRaw[0] === "object" &&
      idBrandsRaw[0] != null &&
      "idSubCategory" in idBrandsRaw[0] &&
      Array.isArray(idBrandsRaw[0].idBrands);
    if (isBackendShape) return entry;
    const idSubCategory = entry.idSubCategory;
    const idSubCategories = entry.idSubCategories ?? (idSubCategory != null ? [idSubCategory] : []);
    return {
      idSubCategories,
      idBrands:
        idSubCategories.length > 0
          ? idSubCategories.map((subId) => ({ idSubCategory: subId, idBrands: idBrandsRaw }))
          : [],
    };
  });
}

export const saveFilterSettings = createAsyncThunk(
  "category/saveFilterSettings",
  async ({ slug, filters, filterName }, { rejectWithValue }) => {
    const token = localStorage.getItem("user");

    let payload = { ...filters, filterName };
    if (slug === "category-fast-order" && Array.isArray(filters?.uniqueIDClickedSubCategoriesBrands)) {
      const normalized = normalizeCategorySubCategoriesBrands(filters.uniqueIDClickedSubCategoriesBrands);

      payload = {
        ...filters,
        uniqueIDClickedSubCategoriesBrands: normalized,
        filterName,
      };
    }

    try {

      const response = await fetch(getApiUrl(`/save-filters/${slug}/create`), {
        method: "POST",
        headers: new Headers({
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (process.env.NODE_ENV === "development") {
          console.warn("[saveFilterSettings] API error", { status: response.status, errorData });
        }
        const error = {
          status: response.status,
          message: errorData?.message || getHttpCodeMessage(response.status),
        };
        return rejectWithValue(error);
      }

      const data = await response.json();

      return data;
    } catch (error) {
      return rejectWithValue("Network error or server not responding");
    }
  }
);