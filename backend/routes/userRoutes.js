import express from "express";
import {
  getUserInfo,
  // getUsers,
  registerUser, 
  updateUser, 
  userStockAlertInfoGet, 
  userStockAlertInfoRemove, 
  userStockAlertInfoSet,
  addedToFavorites,
  addToFavorites,
  removeFromFavorites,
  getUserFavoritesList
  // updateUser,
  // removeUser
} from "../controllers/userControllers.js"; // Make sure this is updated to use the new controller



const router = express.Router();

// Routes for users
// router.post(`${apiPrefix}`, getUsers); // Get all users
router.post(`/add`, registerUser); // Add a user
router.post(`/update`, updateUser); // Update a user
router.get(`/getuserinfo`, getUserInfo); // Get user info
router.get(`/userstockalertinfoget/:product_id`, userStockAlertInfoGet); // Get stock alert info for specific product
router.post(`/userstockalertinfoset`, userStockAlertInfoSet); // Set/update stock alert (product_id comes from request body)
router.delete(`/userstockalertinforemove/:product_id`, userStockAlertInfoRemove); // Remove stock alert for specific product
router.get(`/addedtofavorites/:productId`, addedToFavorites); // Check if product is in favorites
router.post(`/addtofavorites/:productId`, addToFavorites); // Add product to favorites
router.delete(`/removefromfavorites/:productId`, removeFromFavorites); // Remove product from favorites
router.get(`/favorites`, getUserFavoritesList); // Get user info


// router.post(`${apiPrefix}/remove`, removeUser); // Remove a user

export default router;