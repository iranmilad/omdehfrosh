import { Router } from "express";
import {
  getAllArchives,
  getArchiveById,
  createArchive,
  updateArchive,
  deleteArchive,
  batchImportArchives,
} from '../../controllers/master-dashboard/archiveControllers.js'


const router = Router();

router.get("/", getAllArchives);

router.get("/:id", getArchiveById);

router.post("/create", createArchive);

router.put("/update/:id", updateArchive);

router.delete("/delete/:id", deleteArchive);

router.post("/batch-import", batchImportArchives);

export default router;
