
// H:\projects\React\j2b.market\backend\routes\universalPaymentRoutes.js
import { Router } from "express";
import {
    getUniversalPaymentLink,
    verifyPayment,
    verifyPaymentGet
} from "../controllers/universalPaymentControllers.js";

const router = Router();

console.log('🔵 Universal payment routes file loaded');

router.post("/get-payment-link", getUniversalPaymentLink);
console.log('🔵 Registered POST /get-payment-link');

// Listener page: GET with URL params → returns { link, message }. No body.
router.get("/verify-payment", verifyPaymentGet);
console.log('🔵 Registered GET /verify-payment');

router.post("/verify-payment", verifyPayment);
console.log('🔵 Registered POST /verify-payment');

export default router;
