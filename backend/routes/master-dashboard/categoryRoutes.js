import { Router } from "express";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  batchImportCategories,
  batchImportCategoryFilters
} from "../../controllers/master-dashboard/categoryController.js";

const router = Router();

// Get all categories
router.get("/", getAllCategories);

// Get a category by ID
router.get("/:id", getCategoryById);

// Create a new category
router.post("/create", createCategory);

// Update an existing category by ID
router.put("/update/:id", updateCategory);

// Delete a category by ID
router.delete("/delete/:id", deleteCategory);

// Batch import categories
router.post("/batch-import", batchImportCategories);


router.post("/filters/batch-import", batchImportCategoryFilters);




export default router;
