import express from "express";
import {
  createFilterSettingBrandFastEdit,
  createFilterSettingCategoryFastEdit,
  getAllBrandFilterSettingsFastEdit,
  getAllCategoryFilterSettingsFastEdit,
  deleteFilterSettingBrandFastEdit,
  deleteFilterSettingCategoryFastEdit,
  updateFilterSettingBrandFastEdit,
  updateFilterSettingCategoryFastEdit
} from "../controllers/filterSettingsFastEditControllers.js";

const router = express.Router();

// Brand
router.post("/brand-fast-edit/create", createFilterSettingBrandFastEdit);
router.put("/brand-fast-edit/update", updateFilterSettingBrandFastEdit);
router.delete("/brand-fast-edit/delete", deleteFilterSettingBrandFastEdit);
router.get("/brand-fast-edit", getAllBrandFilterSettingsFastEdit);

// Category
router.post("/category-fast-edit/create", createFilterSettingCategoryFastEdit);
router.put("/category-fast-edit/update", updateFilterSettingCategoryFastEdit);
router.delete("/category-fast-edit/delete", deleteFilterSettingCategoryFastEdit);
router.get("/category-fast-edit", getAllCategoryFilterSettingsFastEdit);

export default router;
