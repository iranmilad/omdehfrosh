import express from "express";
import { getBootstrap } from "../controllers/bootstrapController.js";

const router = express.Router();

// GET: fetch bootstrap data
router.get("/", getBootstrap);

export default router;