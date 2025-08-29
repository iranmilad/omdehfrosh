import { Router } from "express";
import { 
  getAllTrendProducts, 
  getTrendProductById, 
  createTrendProduct, 
  updateTrendProduct, 
  deleteTrendProduct, 
  batchImportTrendProducts 
} from '../../controllers/master-dashboard/trendProductsControllers.js'

const router = Router();

// Route to get all trend products
router.get("/", getAllTrendProducts);

// Route to get a specific trend product by ID
router.get("/:id", getTrendProductById);

// Route to create a new trend product
router.post("/create", createTrendProduct);

// Route to update an existing trend product by ID
router.put("/update/:id", updateTrendProduct);

// Route to delete a trend product by ID
router.delete("/delete/:id", deleteTrendProduct);

// Route for batch importing trend products
router.post("/batch-import", batchImportTrendProducts);

export default router;
