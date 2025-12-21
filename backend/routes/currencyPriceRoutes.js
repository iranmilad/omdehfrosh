import { Router } from "express";
import { 
  updateCurrencyPrice,
  getCurrencyPrice,
  deleteCurrencyPrice
} from "../controllers/currencyPriceControllers.js";

const router = Router();

// Update or create currency price
router.post("/update", updateCurrencyPrice);

// Get current currency price
router.get("/get", getCurrencyPrice);

// Delete currency price
router.delete("/delete", deleteCurrencyPrice);

export default router;