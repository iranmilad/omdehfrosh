import { Router } from "express";
import { 
  getAllPurchasedProducts, 
  getPurchasedProductById, 
  createPurchasedProduct, 
  updatePurchasedProduct, 
  deletePurchasedProduct, 
  batchImportPurchasedProducts 
} from '../../controllers/master-dashboard/purchasedProductsControllers.js'

const router = Router();

// Route to get all purchased products
router.get("/", getAllPurchasedProducts);

// Route to get a specific purchased product by ID
router.get("/:id", getPurchasedProductById);

// Route to create a new purchased product
router.post("/create", createPurchasedProduct);

// Route to update an existing purchased product by ID
router.put("/update/:id", updatePurchasedProduct);

// Route to delete a purchased product by ID
router.delete("/delete/:id", deletePurchasedProduct);

// Route for batch importing purchased products
router.post("/batch-import", batchImportPurchasedProducts);

export default router;
