// ordersRoutes.js
import express from "express";
import {
  createOrder,
  getOrder,
  getAllOrdersByUserId,
  updateOrderStatus,
  deleteOrder,
  getOrderByReceiptID,
  updateOrderAddress,
  updateBasketOrdersAddress  // NEW
} from "../controllers/ordersController.js";

const router = express.Router();

router.post(`/create`, createOrder);

router.get(`/get/:id`, getOrder);

router.get(`/getorderbyreceiptid/:receipt_id`, getOrderByReceiptID);


router.get(`/allordersbyuserid`, getAllOrdersByUserId);



router.put(`/updateorderstatus/:orderId`, updateOrderStatus);



router.put(`/updateaddress/:orderId`, updateOrderAddress);


router.put(`/updatebasketaddress`, updateBasketOrdersAddress);  // NEW: Update all basket orders


router.delete(`/delete`, deleteOrder);

export default router;