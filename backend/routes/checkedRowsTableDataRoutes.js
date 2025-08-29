import { Router } from "express";
import { fetchTableDataByIds } from "../controllers/checkedRowsTableDataController.js";

const router = Router();

// POST /fetch-table-by-ids/:searchType
router.post("/:searchType", fetchTableDataByIds);

export default router;
