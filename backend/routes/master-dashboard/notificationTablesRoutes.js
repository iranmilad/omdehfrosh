import { Router } from "express";
import {
  batchImportNotificationTables 
}  from "../../controllers/master-dashboard/notificationTablesControllers.js"


const router = Router();



router.post("/batch-import", batchImportNotificationTables);

export default router;
