import { Router } from "express";
import {

  batchImportBrandsDatas } from '../../controllers/master-dashboard/brandsdataControllers.js'

const router = Router();

// // Get all brands
// router.get("/", getAllBrands);

// // Get a brand by ID
// router.get("/:id", getBrandById);

// // Create a new brand
// router.post("/create", createBrand);

// // Update an existing brand by ID
// router.put("/update/:id", updateBrand);

// // Delete a brand by ID
// router.delete("/delete/:id", deleteBrand);

// Batch import brands
router.post("/batch-import", batchImportBrandsDatas);

export default router;