import { Router } from "express";
import { getFastEditCategoryModeTableData } from "../controllers/fastEditCategoryModeTableDataController.js"; // Adjust path

const router = Router();

// Get all fast Edit category mode table data
router.post("/", getFastEditCategoryModeTableData);

export default router;
