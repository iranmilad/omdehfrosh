import express from "express";
import {
  createFilterSettingBrandMode,
  createFilterSettingCategoryMode,
  getAllBrandFilterSettings,
  getAllCategoryFilterSettings,
  deleteFilterSettingBrandMode,
  deleteFilterSettingCategoryMode,
  updateFilterSettingBrandMode,
  updateFilterSettingCategoryMode,
    createFilterSettingBrandFastEdit,
  createFilterSettingCategoryFastEdit,
  getAllBrandFilterSettingsFastEdit,
  getAllCategoryFilterSettingsFastEdit,
  deleteFilterSettingBrandFastEdit,
  deleteFilterSettingCategoryFastEdit,
  updateFilterSettingBrandFastEdit,
  updateFilterSettingCategoryFastEdit
}
  from '../controllers/filterSettingsControllers.js';

const router = express.Router();

router.post("/brand-fast-order/create", createFilterSettingBrandMode); // Create new filter setting

router.post("/category-fast-order/create", createFilterSettingCategoryMode); // Create new filter setting
router.delete("/brand-fast-order/delete", deleteFilterSettingBrandMode);
router.delete("/category-fast-order/delete", deleteFilterSettingCategoryMode);
router.put("/category-fast-order/update/", updateFilterSettingCategoryMode); // Update category filter

router.put("/brand-fast-order/update/", updateFilterSettingBrandMode); // Update brand filter
router.get("/brand-fast-order", getAllBrandFilterSettings);

router.get("/category-fast-order", getAllCategoryFilterSettings);


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

// router.get("/get/:id", getFilterSettingById); // Get one filter setting by ID

// router.get("/all", getAllFilterSettings); // Get all filter settings

// router.put("/update/:id", updateFilterSetting); // Update a filter setting

// router.delete("/delete", deleteFilterSetting); // Delete a filter setting

export default router;
