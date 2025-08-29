import express from "express";
import {
  addCode,
  getDiscountCode,
  removeDiscountCode
} from "../controllers/discountCodeController.js"; // Import controller functions

const router = express.Router();

router.post(`/add`, addCode); // Add a discount code
router.get(`/getdiscountcode`, getDiscountCode); // Get discount code details
router.delete(`/remove`, removeDiscountCode); // Remove a discount code

export default router;
