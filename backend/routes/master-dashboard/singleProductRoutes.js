import { Router } from "express";
import {
  getAllSingleProducts,
  getSingleProductById,
  createSingleProduct,
  updateSingleProduct,
  deleteSingleProduct,
  batchImportSingleProducts
} from '../../controllers/singleProductControllers.js'


const router = Router();

// Route to get all single products
router.get("/", getAllSingleProducts);

// Route to get a specific single product by ID
router.get("/:id", getSingleProductById);

// Route to create a new single product
router.post("/create", createSingleProduct);

// Route to update an existing single product by ID
router.put("/update/:id", updateSingleProduct);

// Route to delete a single product by ID
router.delete("/delete/:id", deleteSingleProduct);

// Route for batch importing single products
router.post("/batch-import", batchImportSingleProducts);

export default router;
