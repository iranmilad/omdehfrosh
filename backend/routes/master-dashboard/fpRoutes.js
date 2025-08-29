import { Router } from "express";
import {
  getAllFPs,
  getFPById,
  createFP,
  updateFP,
  deleteFP,
  batchImportFPs
} from "../../controllers/master-dashboard/fpControllers.js"



const router = Router();

// Get all wide sliders
router.get("/", getAllFPs);

// Get a single wide slider by ID
router.get("/:id", getFPById);

// Create a new wide slider
router.post("/create", createFP);

// Update a wide slider by ID
router.put("/update/:id", updateFP);

// Delete a wide slider by ID
router.delete("/delete/:id", deleteFP);

// Batch import wide sliders
router.post("/batch-import", batchImportFPs);


export default router;
