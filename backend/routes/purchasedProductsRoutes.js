import express from "express";
import {addPurchasedProducts, getPurchasedProducts} from '../controllers/purchasedProductsControllers.js'

const router = express.Router();


// Routes for users
router.post(`/`, getPurchasedProducts); // Get all users
router.post(`/add`, addPurchasedProducts); // Add a user
// router.post(`${apiPrefix}/update`, updateUser); // Update a user
// router.post(`${apiPrefix}/remove`, removeUser); // Remove a user

export default router;
