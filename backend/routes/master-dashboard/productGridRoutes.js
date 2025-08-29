import { Router } from "express";
import { 
  getAllProductGrids, 
  getProductGridById, 
  createProductGrid, 
  updateProductGrid, 
  deleteProductGrid, 
  batchImportProductGrids 
} from '../../controllers/master-dashboard/productGridControllers.js'

const router = Router();

router.get("/", getAllProductGrids);

router.get("/:id", getProductGridById);

router.post("/create", createProductGrid);

router.put("/update/:id", updateProductGrid);

router.delete("/delete/:id", deleteProductGrid);

router.post("/batch-import", batchImportProductGrids);

export default router;
