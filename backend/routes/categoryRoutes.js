import express from "express";
import { getCategoryDataBySlug } from "../controllers/categoryControllers.js";



const router = express.Router();



// GET /api/category/:slug
router.post("/:slug", getCategoryDataBySlug);

export default router;
