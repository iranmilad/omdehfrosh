import { Router } from "express";
import { 
  getAllFastOrderPageBrandModeFilters,
  getFastOrderPageBrandModeFilterById,
  createFastOrderPageBrandModeFilter,
  updateFastOrderPageBrandModeFilter,
  deleteFastOrderPageBrandModeFilter,
  batchImportFastOrderPageBrandModeFilters
} from '../../controllers/master-dashboard/fastOrderPageDataBrandModeFiltersControllers.js'

const router = Router();

// Route to get all filters
router.get("/", getAllFastOrderPageBrandModeFilters);

// Route to get a specific filter by ID
router.get("/:id", getFastOrderPageBrandModeFilterById);

// Route to create a new filter
router.post("/create", createFastOrderPageBrandModeFilter);

// Route to update an existing filter by ID
router.put("/update/:id", updateFastOrderPageBrandModeFilter);

// Route to delete a filter by ID
router.delete("/delete/:id", deleteFastOrderPageBrandModeFilter);

// Route for batch importing filters
router.post("/batch-import", batchImportFastOrderPageBrandModeFilters);

export default router;
