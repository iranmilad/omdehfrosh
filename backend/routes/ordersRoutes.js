// ordersRoutes.js
import express from "express";
import {
  createOrder,
  getOrder,
  getAllOrdersByUserId,
  updateOrderStatus,
  deleteOrder,
  getOrderByReceiptID
} from "../controllers/ordersController.js"; // Import controller functions

const router = express.Router();


router.post(`/create`, createOrder); // Create a new order
router.get(`/get/:id`, getOrder); // Get order details by ID
router.get(`/getorderbyreceiptid/:receipt_id`, getOrderByReceiptID); // Get order details by ID
router.get(`/allordersbyuserid`, getAllOrdersByUserId); // Get all orders
router.put(`/updateorderstatus/:orderId`, updateOrderStatus); // Update order status
router.delete(`/delete`, deleteOrder); // Delete an order


export default router;