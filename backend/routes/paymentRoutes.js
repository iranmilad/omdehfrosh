import { Router } from "express";
import { 
    checkPaymentStatus, 
    getPaymentLink, 
    paymentWebhook,
    getPaymentLinkWallet,
    paymentWebhookWallet,
    checkPaymentStatusWallet,
    walletWithdraw,
    walletTransfer,
    confirmCODPayment
 } from "../controllers/paymentControllers.js";    


const router = Router();


router.post("/wallet/checkpaymentstatus", checkPaymentStatusWallet);            

router.post("/wallet/withdraw", walletWithdraw);    

router.post("/wallet/transfer", walletTransfer);            
router.post("/cod/confirm", confirmCODPayment);

router.post("/getpaymentlink", getPaymentLink);            
router.post("/checkpaymentstatus/:order_id", checkPaymentStatus);            
router.post("/paymentwebhook", paymentWebhook);   
        
router.post("/wallet/getpaymentlink", getPaymentLinkWallet);            
router.post("/wallet/paymentwebhook", paymentWebhookWallet);            


export default router;
