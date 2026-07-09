import { Router } from "express";
import { 
    getCart,
    getCartItemCount,
    updateCartSubscription, 
    updateCart, 
    removeFromCart, 
    getFinalReceipt, 
    updateFinalReceipt, 
    updateFinalReceiptGateway, 
    removeDiscountFinalReceipt,
    vatRequestFinalReceipt
 } from "../controllers/cartControllers.js";
    

const router = Router();

router.get("/", getCart);
router.get("/number", getCartItemCount);            

router.post("/update", updateCart);   

router.post("/updatesubscription", updateCartSubscription);     


router.post("/remove", removeFromCart);

router.get("/getfinalreceipt", getFinalReceipt);

router.post("/updatefinalreceipt", updateFinalReceipt);

router.post("/removeDiscount", removeDiscountFinalReceipt);

router.post("/requestfinalreceipt", vatRequestFinalReceipt);



router.post("/updatefinalreceiptgateway", updateFinalReceiptGateway);


export default router;
