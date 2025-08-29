import { Router } from "express";
import {
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
  batchImportBrands
} from "../../controllers/master-dashboard/brandController.js";

const router = Router();

// Route to get all brands
router.get("/", getAllBrands);

// Route to get a specific brand by ID
router.get("/:id", getBrandById);

// Route to create a new brand
router.post("/create", createBrand);

// Route to update an existing brand by ID
router.put("/update/:id", updateBrand);

// Route to delete a brand by ID
router.delete("/delete/:id", deleteBrand);

// Route for batch importing brands
router.post("/batch-import", batchImportBrands);

export default router;
