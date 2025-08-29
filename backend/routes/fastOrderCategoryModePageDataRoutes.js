import { Router } from "express";
import {
  getAllFastOrderCategories,
  getFastOrderCategoryById,
  createFastOrderCategory,
  updateFastOrderCategory,
  deleteFastOrderCategory,
  batchImportFastOrderCategories,
} from '../controllers/fastOrderCategoryModePageDataControllers.js'


const router = Router();

// Route to get all fast order categories
router.get("/", getAllFastOrderCategories);

// Route to get a specific category by ID
router.get("/:id", getFastOrderCategoryById);

// Route to create a new fast order category
router.post("/create", createFastOrderCategory);

// Route to update an existing category by ID
router.put("/update/:id", updateFastOrderCategory);

// Route to delete a category by ID
router.delete("/delete/:id", deleteFastOrderCategory);

// Route for batch importing categories
router.post("/batch-import", batchImportFastOrderCategories);

export default router;
