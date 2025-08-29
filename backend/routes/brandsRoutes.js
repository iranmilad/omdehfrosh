import express from "express";
import { getBrandProducts, getFilterOptions } from "../controllers/brandsControllers.js";

const router = express.Router();

// POST: fetch brand products with filters
router.post("/brandproducts", getBrandProducts);

// GET: fetch filter options only
router.get("/brandproducts/filters", getFilterOptions);

export default router;
