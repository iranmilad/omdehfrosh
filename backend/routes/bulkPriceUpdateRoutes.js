// backend/routes/bulkPriceUpdateRoutes.js
import express from "express";
import { bulkUpdatePrices } from "../controllers/bulkPriceUpdateController.js";

const router = express.Router();

// POST /api/fastedit/bulk-price-update
router.post("/bulk-price-update", bulkUpdatePrices);

export default router;
