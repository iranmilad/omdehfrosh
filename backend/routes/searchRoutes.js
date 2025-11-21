// routes/searchRoutes.js
import express from "express";
import { searchController } from "../controllers/searchController.js";

const router = express.Router();


// GET /search?query=yourSearchTerm
router.get("/", searchController);



export default router;