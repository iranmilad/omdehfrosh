// ordersController.js
import { toShamsiDate } from "../libs/convertShamsi.js";
import getUserFromToken from "../libs/verifyToken.js";
import Order from "../models/Order.js"; // Import Order model
import jwt from "jsonwebtoken";



// Create a new order
export const createOrder = async (req, res) => {
  try {
    const { customerName, items, totalAmount, status } = req.body;

    if (!customerName || !items || items.length === 0 || !totalAmount) {
      return res.status(400).json({ message: "Invalid order data" });
    }

    const newOrder = new Order({
      customerName,
      items,
      totalAmount,
      status: status || "Pending",
    });

    await newOrder.save();
    res.status(201).json({ message: "Order created successfully", newOrder });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get order details by ID

export const getOrder = async (req, res) => {
    try {



      const { user_id } = getUserFromToken(req, res);  // This will handle token extraction and verification

      const userId = user_id;
  
      if (!userId) {
        return res.status(400).json({ message: "User Not Found" });
      }
  
      // Extract Order ID
      const { id } = req.params; 
  
      if (!id) {
        return res.status(400).json({ message: "Order ID is required" });
      }
  
      // Find Order
      const order = await Order.findOne({ order_id: id });
  
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
  
      res.status(200).json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
  
  export const getOrderByReceiptID = async (req, res) => {
    try {



      const { user_id } = getUserFromToken(req, res);  // This will handle token extraction and verification

      const userId = user_id;
  
      if (!userId) {
        return res.status(400).json({ message: "User Not Found" });
      }
  
      // Extract Order ID
      const { receipt_id } = req.params; 

  
      if (!receipt_id) {
        return res.status(400).json({ message: "Order ID is required" });
      }
  
      // Find Order
      const order = await Order.findOne({ receipt_id: receipt_id });
  
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
  
      res.status(200).json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

// Get all orders
export const getAllOrdersByUserId = async (req, res) => {



  const { user_id } = getUserFromToken(req, res);  // This will handle token extraction and verification


  const userId = user_id

  if (!userId) {
    return res.status(400).json({ message: "User Not Found" });
  }

  try {


    const orders = await Order.find({ user_id: userId });

    const formattedOrders = orders.map(order => ({
      ...order.toObject(), // Convert Mongoose document to a plain object
      date: toShamsiDate(order.createdAt), // Add the new field
    }));

    res.status(200).json(formattedOrders);

  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params; // Get the custom order_id from the request params
  const { deliveredStatus } = req.body; // Get the delivered status from the request body

  const { user_id } = getUserFromToken(req, res);  // This will handle token extraction and verification

  try {
    // Check if both order_id and deliveredStatus are provided
    if (!orderId || deliveredStatus === undefined) {
      return res.status(400).json({ message: "Order ID and deliveredStatus are required" });
    }

    // Update the 'delivered' field in the database with 'deliveredStatus' from the request body
    const updatedOrder = await Order.findOneAndUpdate(
      { order_id: orderId }, // Use the custom order_id to find the document
      { delivered: deliveredStatus }, // Update the 'delivered' field
      { new: true } // Return the updated order
    );

    // If no order is found with the given order_id, return 404
    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Send success response with the updated order
    res.status(200).json({ message: "Order status updated successfully", updatedOrder });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



// Delete an order
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ message: "Order ID is required" });

    const deletedOrder = await Order.findByIdAndDelete(id);
    if (!deletedOrder) return res.status(404).json({ message: "Order not found" });

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
