
// H:\projects\React\j2b.market\backend\routes\universalPaymentRoutes.js
import { Router } from "express";
import {
    getUniversalPaymentLink,
    verifyPayment
} from "../controllers/universalPaymentControllers.js";

const router = Router();

console.log('🔵 Universal payment routes file loaded');

// Universal payment link route - handles both wallet and order payments
router.post("/get-payment-link", getUniversalPaymentLink);
console.log('🔵 Registered POST /get-payment-link');

// Verify payment route - called by listener page
router.post("/verify-payment", verifyPayment);
console.log('🔵 Registered POST /verify-payment');

export default router;
