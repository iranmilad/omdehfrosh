import { Router } from 'express';
import {
  getAllProductComments,
  getProductCommentsById,
  addProductComment,
  updateProductComment,
  deleteProductComment,
  batchImportProductComments // Import the batch import controller
} from '../controllers/commentController.js'

const router = Router();

// Route to get all product comments
router.get("/", getAllProductComments);

// Route to get product comments by product ID
router.get("/:id", getProductCommentsById);

// Route to add a new comment for a product combination
router.post("/add", addProductComment);

// Route to update an existing comment by commentId
router.put("/update", updateProductComment);

// Route to delete a comment by commentId
router.delete("/delete/:productId/:combinationId/:supplierId/:commentId", deleteProductComment);




export default router;
