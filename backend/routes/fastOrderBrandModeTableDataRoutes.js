import { Router } from "express";
import { getFastOrderBrandModeTableData, fetchTableDataByIds} from "../controllers/fastOrderBrandModeTableDataController.js";

const router = Router();

// Get all fast Order brand mode table data
router.post("/", getFastOrderBrandModeTableData);




// POST /fetch-table-by-ids/:searchType
router.post("/fetch-table-by-ids", fetchTableDataByIds);


export default router;
