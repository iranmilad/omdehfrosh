import { Router } from "express";
import { getFastOrderCategoryModeTableData, fetchTableDataByIds } from "../controllers/fastOrderCategoryModeTableDataController.js"; // Adjust path

const router = Router();

// Get all fast Order category mode table data
router.post("/", getFastOrderCategoryModeTableData);

router.post("/fetch-table-by-ids", fetchTableDataByIds);

export default router;
