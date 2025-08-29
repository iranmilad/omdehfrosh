import { Router } from "express";
import {
  getAllGateWaysData,
  getGateWayDataById,
  createGateWayData,
  updateGateWayData,
  deleteGateWayData,
  batchImportGateWaysData,
} from "../controllers/gateWaysDataControllers.js";

const router = Router();

// Route to get all gateways
router.post("/", getAllGateWaysData);

// Route to get a specific gateway by ID
router.get("/:id", getGateWayDataById);

// Route to create a new gateway
router.post("/create", createGateWayData);

// Route to update an existing gateway by ID
router.put("/update/:id", updateGateWayData);

// Route to delete a gateway by ID
router.delete("/delete/:id", deleteGateWayData);

// Route for batch importing gateways
router.post("/batch-import", batchImportGateWaysData);

export default router;
