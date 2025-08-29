import { Router } from "express";
import { getFastEditBrandModeTableData } from "../controllers/fastEditBrandModeTableDataController.js";

const router = Router();

// Get all fast Edit brand mode table data
router.post("/", getFastEditBrandModeTableData);

export default router;
