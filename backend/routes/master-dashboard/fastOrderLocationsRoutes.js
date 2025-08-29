import { Router } from "express";
import { 
  getAllFastOrderLocations, 
  getFastOrderLocationById, 
  createFastOrderLocation, 
  updateFastOrderLocation, 
  deleteFastOrderLocation, 
  batchImportFastOrderLocations
} from "../../controllers/master-dashboard/fastOrderLocationsController.js";

const router = Router();

// Route to get all fast order locations
router.get("/", getAllFastOrderLocations);

// Route to get a specific fast order location by ID
router.get("/:id", getFastOrderLocationById);

// Route to create a new fast order location
router.post("/create", createFastOrderLocation);

// Route to update an existing fast order location by ID
router.put("/update/:id", updateFastOrderLocation);

// Route to delete a fast order location by ID
router.delete("/delete/:id", deleteFastOrderLocation);

// Route for batch importing fast order locations
router.post("/batch-import", batchImportFastOrderLocations);

export default router;
