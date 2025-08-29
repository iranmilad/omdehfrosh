import { Router } from "express";
import { 
  getAllHomePageProducts, 
  getHomePageProductById, 
  createHomePageProduct, 
  updateHomePageProduct, 
  deleteHomePageProduct, 
  batchImportHomePageProducts
} from '../controllers/productControllers.js';

const router = Router();

// Route to get all home page products
router.get("/", getAllHomePageProducts);

// Route to get a specific product by ID
router.get("/:id", getHomePageProductById);

// Route to create a new home page product
router.post("/create", createHomePageProduct);

// Route to update an existing product by ID
router.put("/update/:id", updateHomePageProduct);

// Route to delete a product by ID
router.delete("/delete/:id", deleteHomePageProduct);

// Route for batch importing products
router.post("/batch-import", batchImportHomePageProducts);



export default router;
