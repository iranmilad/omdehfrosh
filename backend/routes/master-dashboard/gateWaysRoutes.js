import { Router } from "express";
import { 
  getAllGateways, 
  getGatewayById, 
  createGateway, 
  updateGateway, 
  deleteGateway, 
  batchImportGateways 
} from '../../controllers/master-dashboard/gateWaysControllers.js';


const router = Router();

// Route to get all gateways
router.get("/", getAllGateways);

// Route to get a specific gateway by ID
router.get("/:id", getGatewayById);

// Route to create a new gateway
router.post("/create", createGateway);

// Route to update an existing gateway by ID
router.put("/update/:id", updateGateway);

// Route to delete a gateway by ID
router.delete("/delete/:id", deleteGateway);

// Route for batch importing gateways
router.post("/batch-import", batchImportGateways);

export default router;
