import { Router } from "express";
import {
  getAllWideSliders,
  getWideSliderById,
  createWideSlider,
  updateWideSlider,
  deleteWideSlider,
  batchImportWideSliders
} from "../../controllers/master-dashboard/widesliderControllers.js"

const router = Router();

// Get all wide sliders
router.get("/", getAllWideSliders);

// Get a single wide slider by ID
router.get("/:id", getWideSliderById);

// Create a new wide slider
router.post("/create", createWideSlider);

// Update a wide slider by ID
router.put("/update/:id", updateWideSlider);

// Delete a wide slider by ID
router.delete("/delete/:id", deleteWideSlider);

// Batch import wide sliders
router.post("/batch-import", batchImportWideSliders);

export default router;
