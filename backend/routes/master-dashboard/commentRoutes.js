import { Router } from 'express';
import {
  getAllProductComments,
  getProductCommentsById,
  addProductComment,
} from '../../controllers/master-dashboard/commentController.js'


const router = Router();


// Route to get all product comments
router.get("/", getAllProductComments);


// Route to get product comments by product ID
router.get("/:id", getProductCommentsById);

// Route to add a new comment for a product combination
router.post("/batch-import", addProductComment);



export default router;
