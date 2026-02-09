// H:\projects\React\j2b.market\backend\routes\fakeGatewayRoutes.js

import { Router } from "express";
import { handleFakeGatewayPost, getTemporaryDataApi } from "../controllers/fakeGatewayController.js";

const router = Router();

console.log('🔵 Fake gateway routes file loaded');

// POST route for fake-gateway - handles form submissions
router.post("/", handleFakeGatewayPost);
console.log('🔵 Registered POST /fake-gateway');

// GET route to retrieve temporary data
router.get("/data/:tempId", getTemporaryDataApi);
console.log('🔵 Registered GET /fake-gateway/data/:tempId');

export default router;