import express from "express";
import {
  getUserInfo,
  registerUser, 
  updateUser, 
  userStockAlertInfoGet, 
  userStockAlertInfoRemove, 
  userStockAlertInfoSet,
  addedToFavorites,
  addToFavorites,
  removeFromFavorites,
  getUserFavoritesList,
  // New address management functions
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setDefaultAddress
} from "../controllers/userControllers.js";

const router = express.Router();

// Existing routes
router.post(`/add`, registerUser);
router.post(`/update`, updateUser);
router.get(`/getuserinfo`, getUserInfo);
router.get(`/userstockalertinfoget/:product_id`, userStockAlertInfoGet);
router.post(`/userstockalertinfoset`, userStockAlertInfoSet);
router.get(`/userstockalertinforemove/:product_id`, userStockAlertInfoRemove);
router.get(`/addedtofavorites/:productId`, addedToFavorites);
router.post(`/addtofavorites/:productId`, addToFavorites);
router.delete(`/removefromfavorites/:productId`, removeFromFavorites);
router.get(`/favorites`, getUserFavoritesList);

// New address management routes
router.get(`/addresses`, getUserAddresses); // Get all addresses
router.post(`/addresses/add`, addUserAddress); // Add new address
router.put(`/addresses/update/:addressId`, updateUserAddress); // Update address
router.delete(`/addresses/delete/:addressId`, deleteUserAddress); // Delete address
router.post(`/addresses/set-default/:addressId`, setDefaultAddress); // Set default address

export default router;
