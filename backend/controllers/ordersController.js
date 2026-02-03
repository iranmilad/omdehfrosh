// ordersController.js
import { toShamsiDate } from "../libs/convertShamsi.js";
import getUserFromToken from "../libs/verifyToken.js";
import Order from "../models/Order.js"; // Import Order model
import jwt from "jsonwebtoken";
import OrderJ2B from "../models/Orders_J2B.js";
import OrderItemJ2B from "../models/OrderItemJ2B.js";
import ProductComments from "../models/ProductComments.js";

// ordersController.js

// NEW: Update address for all basket orders
export const updateBasketOrdersAddress = async (req, res) => {
  try {
    const { user_id } = getUserFromToken(req, res);
    
    if (!user_id) {
      return res.status(401).json({ message: "Unauthorized: user not found" });
    }

    const address = req.body;

    console.log(JSON.stringify(address));

    if (!address) {
      return res.status(400).json({ message: "Address data is required" });
    }

    // Update ALL basket orders for this user
    const result = await OrderJ2B.updateMany(
      { 
        user_id: user_id.toString(), 
        status: "basket" 
      },
      { 
        $set: { address: address } 
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "No basket orders found" });
    }

    return res.status(200).json({
      success: true,
      message: "Address updated successfully for all basket orders",
      updatedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("Error updating basket orders address:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Keep the existing single order update function
export const updateOrderAddress = async (req, res) => {
  try {
    const { user_id } = getUserFromToken(req, res);

    
    if (!user_id) {
      return res.status(401).json({ message: "Unauthorized: user not found" });
    }

    const { orderId } = req.params;

    const address = req.body;

    console.log(JSON.stringify(address));

    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    if (!address) {
      return res.status(400).json({ message: "Address data is required" });
    }

    // Find and update the order
    const updatedOrder = await OrderJ2B.findOneAndUpdate(
      { id: orderId, user_id: user_id.toString() },
      { address: address },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      order: updatedOrder
    });
  } catch (error) {
    console.error("Error updating order address:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
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
    const { user_id } = getUserFromToken(req, res);
    if (!user_id) {
      return res.status(401).json({ message: "Unauthorized: user not found" });
    }

    const orderId = req.params.id;

    // Find the order by ID and user
    const order = await OrderJ2B.findOne({ id: orderId, user_id }).lean();
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Find all items for this order
    const items = await OrderItemJ2B.find({ order_id: order.id }).lean();

    // Which product IDs in this order already have a comment from this user (one comment per item)
    const productIdsInOrder = [...new Set(items.flatMap((i) => (i.product_id || []).map((p) => p && p.id).filter(Boolean)).map(String))];
    let commentedProductIds = [];
    if (productIdsInOrder.length > 0) {
      const docs = await ProductComments.find({ productId: { $in: productIdsInOrder } }).lean();
      const orderIdStr = String(order.id);
      for (const doc of docs) {
        const hasCommentForThisOrder = (doc.comments || []).some(
          (c) => c && String(c.orderId) === orderIdStr && Number(c.userId) === Number(user_id)
        );
        if (hasCommentForThisOrder) commentedProductIds.push(String(doc.productId));
      }
    }

    // Return combined order + items + commentedProductIds so frontend can hide "ثبت دیدگاه" for those
    return res.status(200).json({
      success: true,
      order: {
        ...order,
        items,
        commentedProductIds,
      },
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return res.status(500).json({ message: "Internal Server Error" });
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
  try {
    // Extract user_id from token
    const { user_id } = getUserFromToken(req, res);

    if (!user_id) {
      return res.status(401).json({ message: "Unauthorized: user not found" });
    }

    // Fetch all orders for this user
    const orders = await OrderJ2B.find({ user_id: user_id })
      .sort({ createdAt: -1 }) // latest orders first
      .lean();

    // Map orders to a clean structure for frontend
    const response = orders.map((order) => ({
      orderId: order.id, // your custom order ID
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone_number,
      supplierId: order.supplier_id,
      userId: order.user_id,
      totalPrice: order.total_price,
      totalDiscount: order.total_discount,
      discountCodeId: order.discount_code_id,
      status: order.status,
      deliveryType: order.delivery_type,
      paymentMethod: order.payment_type || order.payment_method, // Use payment_type if available, fallback to payment_method
      paymentType: order.payment_type, // Also include payment_type separately
      isPaid: order.isPaid,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }));

    return res.status(200).json({ success: true, orders: response });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;   // Custom order ID
  const { deliveredStatus } = req.body;      // Boolean true/false

  console.log(deliveredStatus, orderId)

  const { user_id } = getUserFromToken(req, res); // optional: verify user

  try {
    if (!orderId || deliveredStatus === undefined) {
      return res.status(400).json({ message: "Order ID and status are required" });
    }

    // Convert boolean to string status
    const newStatus = deliveredStatus ? "delivered" : "processing";

    // Update order status
const updatedOrder = await OrderJ2B.findOneAndUpdate(
  { id: orderId },
  { status: newStatus },
  { new: true }
);

const y = OrderJ2B.find({ id: "order_4b88e692-3b57-4f1d-8fd9-b24b6569546e" })

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Order status updated successfully",
      updatedOrder
    });
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
