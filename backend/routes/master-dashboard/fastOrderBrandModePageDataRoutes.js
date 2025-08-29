import { Router } from "express";
import {
  getAllFastOrderBrands,
  getFastOrderBrandById,
  createFastOrderBrand,
  updateFastOrderBrand,
  deleteFastOrderBrand,
  batchImportFastOrderBrands,
} from '../../controllers/master-dashboard/fastOrderBrandModePageDataController.js'



const router = Router();

// Route to get all fast order brands
router.get("/", getAllFastOrderBrands);

// Route to get a specific brand by ID
router.get("/:id", getFastOrderBrandById);

// Route to create a new fast order brand
router.post("/create", createFastOrderBrand);

// Route to update an existing brand by ID
router.put("/update/:id", updateFastOrderBrand);

// Route to delete a brand by ID
router.delete("/delete/:id", deleteFastOrderBrand);

// Route for batch importing brands
router.post("/batch-import", batchImportFastOrderBrands);

export default router;
