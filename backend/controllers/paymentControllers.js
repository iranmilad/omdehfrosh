import { generateToken } from "../jwt/jwt_func.js";
import Cart from "../models/Cart.js"; // Ensure the correct path
import jwt from "jsonwebtoken";
import FinalReceipt from "../models/FinalReciept.js";
import DiscountCode from "../models/DiscountCode.js";
import PaymentLink from "../models/PaymentLink.js"; // Model for saving generated payment links
import { stat } from "fs";
import crypto from "crypto";
import Order from "../models/Order.js"; // Assuming these models are imported correctly
import PaymentLinkWallet from "../models/PaymentLinkWallet.js";
import UserMyAccount from "../models/UserMyAccount.js";
import { v4 as uuidv4 } from 'uuid'; // For generating unique requestId


import dotenv from "dotenv";
import UserAccounts from "../models/User.js";
import getUserFromToken from "../libs/verifyToken.js";
import PaymentWallet from "../models/PaymentWallet.js";
import SingleProduct from "../models/SingleProduct.js";
import OrderItemJ2B from "../models/OrderItemJ2B.js";
import OrderJ2B from "../models/Orders_J2B.js"; // Your order schema
import Transaction from "../models/Transaction.js";




dotenv.config();

const generateRequestId = () => {
  const randomNum = Math.floor(Math.random() * 1000000); // Up to 6 digits
  return `req_${randomNum}`;
};


// export const getPaymentLink = async (req, res) => {
//   try {
    
//     const { paymentData } = req.body;

//     console.log(paymentData)


//     // const { user_id } = getUserFromToken(req, res);  // This will handle token extraction and verification
//     // if (!user_id) {
//     //   return res.status(403).json({ message: "Unauthorized" });
//     // }

//     // const userId = user_id

//     // // Validate cartfinalreceipt data
//     // if ( !receipt_id || !reference_cart_id) {
//     //   return res.status(400).json({ message: "Invalid cart final receipt data" });
//     // }

//     // const gateway_id = 1; // Always 1

//     // // Check if a payment link already exists
//     // let existingPaymentLink = await PaymentLink.findOne({
//     //   receipt_id: receipt_id,
//     //   reference_cart_id: reference_cart_id,
//     //   gateway_id,
//     // });

//     // if (existingPaymentLink) {
//     //   return res.json({
//     //     message: "Payment link already exists",
//     //     status: true,
//     //     payment_link: existingPaymentLink.link_url,
//     //     body: existingPaymentLink.body,
//     //     link_id: existingPaymentLink.link_id,
//     //     receipt_id: existingPaymentLink.receipt_id,
//     //     // authority_id: existingPaymentLink.authority_id,
//     //     gateway_id: existingPaymentLink.gateway_id,
//     //   });
//     // }

//     // // Generate unique IDs
//     // const link_id = `pay_${Math.random().toString(36).substring(2, 12)}`;
//     // // const authority_id = `A${crypto.randomBytes(15).toString("hex").toUpperCase().slice(0, 25)}`;

//     // // const referral_link = `${process.env.BASE_URL}/payment-checkstatus`;
    

//     // const body = 'amount=5000'

//     // const callback_url = `http://localhost:5000/api/payment/paymentwebhook?receipt_id=${receipt_id}?status=ok`;

//     // const cartFinalReceiptDb = await FinalReceipt.findOne({
//     //   receipt_id: receipt_id,
//     //   reference_cart_id: reference_cart_id,
//     //   user_id: userId
//     // });


//     // // Generate the payment URL
//     // // const payment_url = `https://payment-provider.com/checkout?amount=${cartfinalreceipt.totalPriceToPay}&currency=USD&receipt_id=${cartfinalreceipt.receipt_id}&user_id=${userId}&link_id=${link_id}&authority_id=${authority_id}&referral_link=${referral_link}&gateway_id=${gateway_id}`;
    
//     // const payment_url = `https://payment-provider.com/checkout`;

//     // // Create a new PaymentLink document
//     // const newPaymentLink = new PaymentLink({
//     //   link_id,
//     //   // authority_id,
//     //   link_url: payment_url,
//     //   payment_amount: cartFinalReceiptDb.totalPriceToPay,
//     //   payment_currency: 'USD',
//     //   user_id: userId,
//     //   body: body,
//     //   receipt_id: cartFinalReceiptDb.receipt_id,
//     //   reference_cart_id: cartFinalReceiptDb.reference_cart_id,
//     //   callback_url,
//     //   gateway_id,
//     // });

//     // // Save to DB and check for errors
//     // await newPaymentLink.save()
      

//     // // Return the payment link
//     // res.json({
//     //   message: "ok",
//     //   status: true,
//     //   payment_link: payment_url,
//     //   link_id,
//     //   receipt_id: cartFinalReceiptDb.receipt_id,
//     //   body,
//     //   // authority_id,
//     //   gateway_id,
//     // });

//   } catch (error) {
//     console.error("Error generating payment link:", error);
//     res.status(500).json({ message: "Error generating payment link", error });
//   }
// };





export const walletWithdraw = async (req, res) => {
  try {
    const tokenData = getUserFromToken(req, res);
    if (!tokenData || !tokenData.user_id) {
      return res.status(401).json({ message: "Unauthorized: user not found" });
    }
    const user_id = tokenData.user_id;

    const { withdrawData } = req.body;
    const { amount } = withdrawData;

    const userAccount = await UserMyAccount.findOne({ userId: user_id });

    if (!userAccount) {
      return res.status(404).json({ message: "User account not found" });
    }

    // Phone number is no longer sent from frontend - get it from user account
    // No need to validate phone match anymore since we get it from token

    // Create new pending withdrawal
    const newWithdraw = {
      requestId: generateRequestId(),
      date: "13/03/1400",
      amount: parseInt(amount, 10),
      status: "pending",
      statusDescriptionFa: "در انتظار بررسی",
      note: "درخواست برداشت در انتظار بررسی",
    };

    userAccount.wallet.pendingWithdrawals.push(newWithdraw);

    await userAccount.save();

      // res.status(405).send()


      // res.status(201).json({ 
      //   message: "خطایی رخ داده است", 
      //   state: "error",
      //   errors: [
      //     {name: "phone", label: "شماره تلفن", message: "شماره تلفن به عدد وارد کنید"},
      //     {name: "amount", label: "مبلغ", message: "مبلغ را به عدد وارد کنید"},
      //   ],
        
      // });



    return res.status(200).json({ 
      message: "درخواست ثبت شد", 
      state: "ok",
      newWithdraw 
    });

  } catch (error) {
    console.error("Error processing withdrawal request:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};


export const walletTransfer = async (req, res) => {
  try {
    const tokenData = getUserFromToken(req, res);
    if (!tokenData || !tokenData.user_id) {
      return res.status(401).json({ message: "Unauthorized: user not found" });
    }
    const user_id = tokenData.user_id;

    const { transferData } = req.body;
    const { receiverPhone, amount, note } = transferData;
    const numericAmount = Number(amount);

    // Get sender from token (user_id), receiver from receiverPhone
    const sender = await UserMyAccount.findOne({ userId: user_id });
    const receiver = await UserMyAccount.findOne({ phoneNumber: receiverPhone });

    if (!sender) {
      return res.status(404).json({ message: "Sender account not found" });
    }

    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    // Prevent transferring to self
    if (sender.phoneNumber === receiverPhone) {
      return res.status(400).json({ message: "Cannot transfer to yourself" });
    }

    if (sender.wallet.balance < numericAmount) {
      return res.status(400).json({ message: "Insufficient wallet balance" });
    }

    const transferId = `trf_${Date.now()}`;

    const transferRecord = {
      transferId,
      senderId: sender.userId,
      receiverId: receiver.userId,
      amount: numericAmount,
      date: "13/03/1400",
      status: "completed",
      statusDescriptionFa: "تکمیل‌شده",
      note
    };

    // Update sender
    sender.wallet.balance -= numericAmount;
    sender.wallet.transfers.push(transferRecord);

    // Update receiver
    receiver.wallet.balance += numericAmount;
    receiver.wallet.transfers.push(transferRecord);

    await sender.save();
    await receiver.save();

      // res.status(405).send()


      // res.status(201).json({ 
      //   message: "خطایی رخ داده است", 
      //   state: "error",
      //   errors: [
      //     {name: "senderPhone", label: "شماره تلفن فرستنده", message: "شماره تلفن به عدد وارد کنید"},
      //     {name: "receiverPhone", label: "شماره تلفن گیرنده", message: "شماره تلفن را به عدد وارد کنید"},
      //     {name: "amount", label: "مبلغ", message: "مبلغ را به عدد وارد کنید"},
      //     {name: "note", label: "توضیحات", message: "توضیحات را وارد کنید"},

      //   ],
        
      // });




    return res.status(200).json({ 
      message: "درخواست ثبت شد", 
      state: "ok"
    });

    // return res.status(200).json({
    //   message: "Wallet transfer completed successfully",
    //   transfer: transferRecord
    // });

  } catch (error) {
    console.error("Error processing wallet transfer:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};
export const confirmCODPayment = async (req, res) => {
  try {
    const { orderId, sellerId, amount, payment_method } = req.body;

    console.log(JSON.stringify({orderId, sellerId, amount, payment_method}))

    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");

    // Get user from token
    const tokenData = getUserFromToken(req, res);
    if (!tokenData || !tokenData.user_id) {
      return res.status(401).json({ message: "Unauthorized: user not found" });
    }
    const user_id = tokenData.user_id;

    // Validate required fields
    if (!orderId || !amount || payment_method !== 'cod') {
      return res.status(400).json({ 
        message: "Invalid COD confirmation data",
        error: "orderId, amount, and payment_method='cod' are required"
      });
    }

    console.log('=== Processing COD Confirmation ===');
    console.log('Order ID:', orderId);
    console.log('Seller ID:', sellerId);
    console.log('Amount:', amount);
    console.log('User ID:', user_id);

    // Find the order
    const order = await OrderJ2B.findOne({ id: orderId, user_id });

    if (!order) {
      console.error(`Order not found: ${orderId} for user: ${user_id}`);
      return res.status(404).json({ 
        message: "Order not found",
        error: `Order ${orderId} not found for current user`
      });
    }

    // Check if order is already confirmed/paid
    if (order.status === 'processing' || order.status === 'complete') {
      return res.status(400).json({ 
        message: "Order already confirmed",
        error: "This order has already been confirmed"
      });
    }

    // Update order items for COD
    const updateFields = {
      isPaid: "unpaid", // COD orders remain unpaid until delivery
      status: "processing",
      updatedAt: new Date(),
      payment_type: 'cod',
      payment_method: 'cod',
      paymentMethod: { name: 'cod', paymentMethod: 'cod' }
    };

    if (sellerId) {
      // Update specific seller's items
      await OrderItemJ2B.updateMany(
        { 
          order_id: order.id,
          supplier_id: sellerId
        },
        { $set: updateFields }
      );
    } else {
      // Update all items
      await OrderItemJ2B.updateMany(
        { order_id: order.id },
        { $set: updateFields }
      );
    }

    // Check if all items are confirmed
    const unconfirmedItems = await OrderItemJ2B.countDocuments({
      order_id: order.id,
      status: { $ne: "processing" }
    });

    // Update main order
    const orderUpdateFields = {
      updatedAt: new Date(),
      payment_type: 'cod',
      payment_method: 'cod'
    };

    if (unconfirmedItems === 0) {
      // All items confirmed
      await OrderJ2B.updateOne(
        { id: order.id },
        { 
          $set: { 
            ...orderUpdateFields,
            isPaid: "unpaid", // Main order stays unpaid for COD
            status: "processing"
          } 
        }
      );
    } else {
      // Partially confirmed
      await OrderJ2B.updateOne(
        { id: order.id },
        { 
          $set: { 
            ...orderUpdateFields,
            isPaid: "unpaid", // Main order stays unpaid for COD
            status: "waiting"
          } 
        }
      );
    }

    console.log('✅ COD order confirmed successfully');

    // Return success response
    return res.status(200).json({ 
      success: true,
      message: "COD order confirmed successfully",
      orderId: order.id,
      status: unconfirmedItems === 0 ? "processing" : "waiting",
      isPaid: "unpaid", // COD orders stay unpaid
      payment_type: 'cod',
      payment_method: 'cod',
      processedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Error confirming COD payment:", error);
    console.error("Request data:", JSON.stringify(req.body, null, 2));
    
    res.status(500).json({ 
      success: false,
      message: "Server Error", 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
export const checkPaymentStatusWallet = async (req, res) => {
  try {
    // Extract data from request body
    const { status, body, paymentData } = req.body;
    
    console.log(JSON.stringify(req.body))
    
    // Validate required fields
    if (!body || !body.transaction_id) {
      console.log("❌ Missing transaction_id in request body");
      return res.status(400).json({ 
        message: "Missing required transaction data",
        status: "failed",
        error: "Transaction ID is required",
        debug: {
          received_body: body,
          has_transaction_id: !!body?.transaction_id
        }
      });
    }
    
    const transactionId = body.transaction_id;
    console.log("🔍 Looking for transaction with ID:", transactionId);
    console.log("Transaction ID type:", typeof transactionId);
    console.log("Transaction ID length:", transactionId?.length);
    
    // First, let's see what transactions exist in the database
    const allTransactions = await Transaction.find({}).limit(10).sort({ createdAt: -1 });
    console.log("📋 Recent transactions in database:");
    allTransactions.forEach((tx, index) => {
      console.log(`${index + 1}. ID: ${tx.transactionId} | User: ${tx.userId} | Status: ${tx.status} | Amount: ${tx.amount}`);
    });
    
    // Try multiple search strategies
    console.log("🔍 Searching with different strategies...");
    
    // Strategy 1: Exact match
    let transaction = await Transaction.findOne({ transactionId: transactionId });
    console.log("Strategy 1 (exact match):", transaction ? "FOUND" : "NOT FOUND");
    
    // Strategy 2: Case-insensitive search
    if (!transaction) {
      transaction = await Transaction.findOne({ 
        transactionId: { $regex: new RegExp(`^${transactionId}$`, 'i') }
      });
      console.log("Strategy 2 (case-insensitive):", transaction ? "FOUND" : "NOT FOUND");
    }
    
    // Strategy 3: Partial match (in case there are extra characters)
    if (!transaction) {
      transaction = await Transaction.findOne({ 
        transactionId: { $regex: transactionId }
      });
      console.log("Strategy 3 (partial match):", transaction ? "FOUND" : "NOT FOUND");
    }
    
    // Strategy 4: Search by MongoDB ObjectId if the transaction_id looks like one
    if (!transaction && transactionId.match(/^[0-9a-fA-F]{24}$/)) {
      try {
        transaction = await Transaction.findById(transactionId);
        console.log("Strategy 4 (ObjectId search):", transaction ? "FOUND" : "NOT FOUND");
      } catch (e) {
        console.log("Strategy 4 failed:", e.message);
      }
    }
    
    // Strategy 5: Search by user_id and amount (as a fallback)
    if (!transaction && body.user_id && body.amount) {
      console.log("🔍 Trying fallback search by user_id and amount...");
      const fallbackTransactions = await Transaction.find({ 
        userId: body.user_id,
        amount: parseInt(body.amount),
        status: { $in: ['pending', 'created'] }
      }).sort({ createdAt: -1 }).limit(5);
      
      console.log("Found transactions by user/amount:", fallbackTransactions.length);
      fallbackTransactions.forEach((tx, index) => {
        console.log(`${index + 1}. ID: ${tx.transactionId} | Created: ${tx.createdAt} | Status: ${tx.status}`);
      });
      
      if (fallbackTransactions.length > 0) {
        transaction = fallbackTransactions[0]; // Take the most recent one
        console.log("✅ Using fallback transaction:", transaction.transactionId);
      }
    }
    
    if (!transaction) {
      console.log("❌ Transaction not found with any strategy");
      console.log("🔍 Debug info:");
      console.log("- Searched for transaction_id:", transactionId);
      console.log("- Available user_id:", body.user_id);
      console.log("- Available amount:", body.amount);
      console.log("- Available gateway:", body.gateway);
      console.log("- Total transactions in DB:", await Transaction.countDocuments());
      
      return res.status(404).json({ 
        message: "Transaction not found",
        status: "failed",
        error: "Transaction ID not found in database",
        debug: {
          searched_transaction_id: transactionId,
          transaction_id_type: typeof transactionId,
          available_fields: Object.keys(body || {}),
          recent_transactions: allTransactions.map(tx => ({
            id: tx.transactionId,
            user: tx.userId,
            amount: tx.amount,
            status: tx.status
          }))
        }
      });
    }
    
    console.log("✅ Found transaction:", {
      id: transaction._id,
      transactionId: transaction.transactionId,
      userId: transaction.userId,
      amount: transaction.amount,
      status: transaction.status,
      gateway: transaction.gatewayName
    });
    
    // Determine the new status based on payment gateway response
    let newStatus = 'failed';
    let paymentVerified = false;
    
    console.log("🔄 Determining payment status...");
    console.log("Frontend status:", status);
    console.log("Body status:", body.status);
    
    if (status === 'OK' || body.status === 'OK') {
      newStatus = 'completed';
      paymentVerified = true;
      console.log("✅ Payment verified as successful");
    } else if (status === 'FAILED' || body.status === 'FAILED') {
      newStatus = 'failed';
      console.log("❌ Payment marked as failed");
    } else {
      newStatus = 'pending';
      console.log("⏳ Payment status unclear, keeping as pending");
    }
    
    // Update the transaction status
    console.log(`🔄 Updating transaction from ${transaction.status} to ${newStatus}`);
    
    const updatedTransaction = await Transaction.findOneAndUpdate(
      { _id: transaction._id },
      { 
        status: newStatus,
        updatedAt: new Date(),
        // Store the gateway response for debugging
        gatewayResponse: {
          status: status,
          body: body,
          processedAt: new Date()
        }
      },
      { new: true }
    );
    
    console.log("✅ Transaction updated successfully");
    
    // If payment is successful, update user's wallet balance
    let walletUpdateResult = null;
    if (paymentVerified && newStatus === 'completed') {
      try {
        console.log(`💰 Updating wallet for user ${transaction.userId}, amount: ${transaction.amount}`);
        
        const user = await User.findOne({ id: transaction.userId });
        
        if (user) {
          const oldBalance = user.walletBalance || 0;
          const newBalance = oldBalance + transaction.amount;
          
          await User.findOneAndUpdate(
            { id: transaction.userId },
            { 
              walletBalance: newBalance,
              updatedAt: new Date()
            }
          );
          
          walletUpdateResult = {
            old_balance: oldBalance,
            new_balance: newBalance,
            added_amount: transaction.amount
          };
          
          console.log(`✅ Wallet updated: ${oldBalance} + ${transaction.amount} = ${newBalance}`);
        } else {
          console.log(`❌ User ${transaction.userId} not found for wallet update`);
          walletUpdateResult = { error: "User not found" };
        }
      } catch (walletError) {
        console.error("❌ Error updating wallet balance:", walletError);
        walletUpdateResult = { error: walletError.message };
      }
    }
    
    // Prepare response data
    const responseData = {
      message: "Payment verification completed",
      status: newStatus === 'completed' ? 'ok' : newStatus,
      payment: {
        transaction_id: updatedTransaction.transactionId,
        order_id: updatedTransaction._id.toString(),
        user_id: updatedTransaction.userId,
        payment_amount: updatedTransaction.amount,
        payment_status: newStatus === 'completed' ? 'paid' : newStatus,
        gateway: updatedTransaction.gatewayName,
        created_at: updatedTransaction.createdAt,
        updated_at: updatedTransaction.updatedAt,
        description: updatedTransaction.description
      },
      wallet_update: walletUpdateResult,
      debug: {
        original_status: transaction.status,
        new_status: newStatus,
        payment_verified: paymentVerified,
        search_method_used: "Enhanced search with fallbacks",
        gateway_response: {
          status: status,
          body: body
        }
      }
    };
    
    console.log("📤 Sending response:", JSON.stringify(responseData, null, 2));
    console.log("=== END DEBUG ===");
    
    res.status(200).json(responseData);
    
  } catch (error) {
    console.error("💥 Error in payment verification:", error);
    res.status(500).json({ 
      message: "Error checking payment status", 
      status: "failed",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// ALTERNATIVE: If transaction IDs are stored differently, try this version
export const checkPaymentStatusWalletAlternative = async (req, res) => {
  try {
    const { status, body } = req.body;
    
    if (!body) {
      return res.status(400).json({ message: "Missing payment body", status: "failed" });
    }
    
    console.log("=== ALTERNATIVE SEARCH METHOD ===");
    console.log("Received data:", JSON.stringify(body, null, 2));
    
    // Try to extract various possible identifiers
    const possibleIds = [
      body.transaction_id,
      body.link_id,
      body.order_id,
      body.id,
      body.transactionId
    ].filter(Boolean);
    
    console.log("Possible IDs to search:", possibleIds);
    
    let transaction = null;
    
    // Try each possible ID
    for (const id of possibleIds) {
      console.log(`Searching for ID: ${id}`);
      
      // Try as transactionId
      transaction = await Transaction.findOne({ transactionId: id });
      if (transaction) {
        console.log(`Found with transactionId: ${id}`);
        break;
      }
      
      // Try as MongoDB ObjectId
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        try {
          transaction = await Transaction.findById(id);
          if (transaction) {
            console.log(`Found with ObjectId: ${id}`);
            break;
          }
        } catch (e) {
          // Invalid ObjectId, continue
        }
      }
    }
    
    // If still not found, try by user and recent timestamp
    if (!transaction && body.user_id) {
      console.log("Trying user-based search...");
      const recentTransactions = await Transaction.find({
        userId: body.user_id,
        status: { $in: ['pending', 'created'] },
        createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) } // Last 30 minutes
      }).sort({ createdAt: -1 });
      
      console.log("Recent user transactions:", recentTransactions.length);
      
      if (recentTransactions.length > 0) {
        transaction = recentTransactions[0];
        console.log("Using most recent transaction:", transaction.transactionId);
      }
    }
    
    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found with any method",
        status: "failed",
        debug: {
          searched_ids: possibleIds,
          user_id: body.user_id
        }
      });
    }
    
    // Process the found transaction
    const newStatus = status === 'OK' ? 'completed' : 'failed';
    
    await Transaction.findByIdAndUpdate(transaction._id, {
      status: newStatus,
      updatedAt: new Date()
    });
    
    res.status(200).json({
      message: "Payment processed",
      status: newStatus === 'completed' ? 'ok' : 'failed',
      payment: {
        transaction_id: transaction.transactionId,
        order_id: transaction._id.toString(),
        user_id: transaction.userId,
        payment_amount: transaction.amount,
        payment_status: newStatus === 'completed' ? 'paid' : newStatus,
        gateway: transaction.gatewayName
      }
    });
    
  } catch (error) {
    console.error("Error in alternative method:", error);
    res.status(500).json({ 
      message: "Processing error", 
      status: "failed",
      error: error.message 
    });
  }
};

export const checkPaymentStatus = async (req, res) => {
  // Set CORS headers FIRST before any operations
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Handle OPTIONS preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const order_id = req.params.order_id;

  try {
    console.log('=== CHECK PAYMENT STATUS START ===');
    console.log('🔍 Checking payment status for order:', order_id);
    console.log('Request method:', req.method);
    console.log('Request params:', req.params);

    if (!order_id) {
      console.error('❌ Missing order_id');
      return res.status(400).json({ 
        success: false,
        message: "order_id is required" 
      });
    }

    // Find main order - ADD ERROR HANDLING
    console.log('🔍 Searching for order in database...');
    const mainOrder = await OrderJ2B.findOne({ id: order_id }).lean();
    
    if (!mainOrder) {
      console.error('❌ Order not found:', order_id);
      return res.status(404).json({ 
        success: false,
        message: "Order not found" 
      });
    }

    console.log('✅ Found order:', {
      id: mainOrder.id,
      status: mainOrder.status,
      isPaid: mainOrder.isPaid,
      user_id: mainOrder.user_id
    });

    // Find all order items for this order - ADD ERROR HANDLING
    console.log('🔍 Searching for order items...');
    const orderItems = await OrderItemJ2B.find({ order_id: order_id }).lean();
    
    console.log(`📦 Found ${orderItems.length} order items`);

    // Enrich order items with product details - WRAP IN TRY-CATCH
    console.log('🔍 Enriching order items with product details...');
    let enrichedOrderItems = [];
    
    try {
      enrichedOrderItems = await Promise.all(
        orderItems.map(async (item) => {
          const enrichedProducts = await Promise.all(
            (item.product_id || []).map(async (prodRef) => {
              try {
                const productDetails = await SingleProduct.findOne({ 
                  id: prodRef.id 
                }).lean();
                
                return {
                  id: prodRef.id,
                  productDetails: productDetails || null
                };
              } catch (err) {
                console.error(`⚠️ Error fetching product ${prodRef.id}:`, err.message);
                return {
                  id: prodRef.id,
                  productDetails: null
                };
              }
            })
          );

          return {
            ...item,
            product_id: enrichedProducts
          };
        })
      );
      console.log('✅ Product enrichment complete');
    } catch (enrichError) {
      console.error('⚠️ Error enriching products, using basic items:', enrichError.message);
      // Fallback to basic items if enrichment fails
      enrichedOrderItems = orderItems.map(item => ({
        ...item,
        product_id: item.product_id || []
      }));
    }

    // Find other related orders for this user - ADD ERROR HANDLING
    console.log('🔍 Searching for related orders...');
    let otherOrders = [];
    
    try {
      otherOrders = await OrderJ2B.find(
        { 
          user_id: mainOrder.user_id,
          id: { $ne: order_id },
          isPaid: { $in: ["unpaid", "prepaid"] },
          status: { $in: ["pending", "rejected", "waiting"] }
        },
        { id: 1, status: 1, isPaid: 1, _id: 0 }
      ).lean();
      
      console.log(`🔗 Found ${otherOrders.length} related orders`);
    } catch (relatedError) {
      console.error('⚠️ Error fetching related orders:', relatedError.message);
      // Continue without related orders
      otherOrders = [];
    }

    // Transform response - ADD ERROR HANDLING FOR EACH SECTION
    console.log('🔄 Building response object...');
    
    const transformedResponse = {
      success: true,
      status: mainOrder.isPaid === "paid" ? "paid" : "pending",
      order: {
        order_id: mainOrder.id,
        isPaid: mainOrder.isPaid || "unpaid",
        status: mainOrder.status || "pending",
        customer_name: mainOrder.customer_name || "",
        customer_phone_number: mainOrder.customer_phone_number || "",
        totalPriceToPay: mainOrder.total_price || 0,
        delivery_type: mainOrder.delivery_type || "",
        paymentComment: mainOrder.paymentComment || null,
        payment_type: mainOrder.payment_type || 'gateway',
        payment_wallet_transactionid: mainOrder.payment_wallet_transactionid || null,
        sellers: enrichedOrderItems.map(item => {
          try {
            const firstProduct = item.product_id?.[0]?.productDetails;
            const sellerLabel = firstProduct?.seller?.label || `تامین‌کننده ${item.supplier_id || 'نامشخص'}`;

            return {
              seller: {
                id: item.supplier_id || item.id || 'unknown',
                label: sellerLabel
              },
              isPaid: item.isPaid || "unpaid",
              status: item.status || "pending",
              quantity: item.quantity || 1,
              price: item.price || 0,
              discount_price: item.discount_price || 0,
              totalPrice: item.totalPrice || (item.price || 0) * (item.quantity || 1),
              vatRequested: item.vatRequested || false,
              paymentMethod: item.paymentMethod || null,
              payment_type: item.payment_type || 'gateway',
              payment_wallet_transactionid: item.payment_wallet_transactionid || null,
              products: item.product_id || [],
              vatLink: item.vatLink || null,
              paymentComment: item.paymentComment || null
            };
          } catch (itemError) {
            console.error('⚠️ Error processing order item:', itemError.message);
            return {
              seller: { id: 'error', label: 'خطا در پردازش' },
              isPaid: "unpaid",
              status: "error",
              quantity: 0,
              price: 0,
              discount_price: 0,
              totalPrice: 0,
              vatRequested: false,
              paymentMethod: null,
              payment_type: 'gateway',
              payment_wallet_transactionid: null,
              products: [],
              vatLink: null,
              paymentComment: null
            };
          }
        })
      },
      orderItems: enrichedOrderItems,
      totalItems: enrichedOrderItems.length,
      summary: {
        overallStatus: mainOrder.isPaid || "unpaid",
        orderStatus: mainOrder.status || "pending",
        totalAmount: mainOrder.total_price || 0,
        paidItems: orderItems.filter(item => item.isPaid === "paid").length,
        unpaidItems: orderItems.filter(item => item.isPaid === "unpaid").length,
        prepaidItems: orderItems.filter(item => 
          item.isPaid === "prepaid" || item.isPaid === "selfprepaid"
        ).length,
        paymentType: mainOrder.payment_type || 'gateway'
      },
      relatedOrders: otherOrders
    };

    console.log('✅ Response built successfully');
    console.log('📊 Sending response with:', {
      orderItems: transformedResponse.totalItems,
      relatedOrders: transformedResponse.relatedOrders.length,
      overallStatus: transformedResponse.summary.overallStatus
    });
    console.log('=== CHECK PAYMENT STATUS END ===\n');

    return res.status(200).json(transformedResponse);

  } catch (error) {
    console.error('❌ FATAL ERROR in checkPaymentStatus:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Stack trace:', error.stack);
    console.error('Order ID that caused error:', order_id);
    console.error('=== CHECK PAYMENT STATUS ERROR END ===\n');
    
    return res.status(500).json({
      success: false,
      message: "Error checking payment status",
      error: error.message,
      errorName: error.name,
      orderId: order_id,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// export const checkPaymentStatus = async (req, res) => {
//   const { order_id } = req.body;

//   try {
//     const paymentLink = await PaymentLink.findOne({ receipt_id: receiptId });

//     if (!paymentLink) {
//       return res.status(404).json({ message: "Payment link not found" });
//     }

//     const finalReceipt = await FinalReceipt.findOne({
//       receipt_id: paymentLink.receipt_id,
//       reference_cart_id: paymentLink.reference_cart_id,
//     });

//     if (!finalReceipt) {
//       return res.status(404).json({ message: "Final receipt not found" });
//     }

//     const { user_id, totalPriceToPay, reference_cart_id, receipt_id } = finalReceipt;

//     if (!user_id || !totalPriceToPay) {
//       return res.status(400).json({ message: "Missing user_id or totalPriceToPay in FinalReceipt" });
//     }

//     const userAccount = await UserAccounts.findOne({ userId: user_id });

//     if (!userAccount || !userAccount.address) {
//       return res.status(404).json({ message: "User account or address not found" });
//     }

//     let order = await Order.findOne({ receipt_id, reference_cart_id });

//     if (order) {
//       order = await Order.findOneAndUpdate(
//         { receipt_id, reference_cart_id },
//         {
//           $set: {
//             isPaid: "prepaid",
//             payment_link: paymentLink.link_url,
//             payment_gateway: paymentLink.gateway_id,
//             paid_at: new Date(),
//             address: userAccount.address,
//             name: `${userAccount.name} ${userAccount.family}`,
//             mobile: userAccount.mobile,
//           },
//         },
//         { new: true }
//       );
//     } else {
//       const uniqueOrderId = `j2border${crypto.randomBytes(8).toString("hex")}`;

//       const newOrder = new Order({
//         order_id: uniqueOrderId,
//         receipt_id,
//         reference_cart_id,
//         isPaid: "prepaid",
//         paymentMethod: finalReceipt.paymentMethod,
//         sellers: finalReceipt.sellers,
//         totalPriceApply: finalReceipt.totalPriceApply,
//         payment_link: paymentLink.link_url,
//         payment_gateway: paymentLink.gateway_id,
//         paid_at: new Date(),
//         user_id,
//         totalPriceToPay,
//         address: userAccount.address,
//         name: `${userAccount.name} ${userAccount.family}`,
//         mobile: userAccount.mobile,
//       });

//       order = await newOrder.save();
//     }


//     if (order && Array.isArray(order.sellers)) {
//       order.sellers = order.sellers.map((seller) => ({
//         ...seller,
//         isPaid: seller.isPaid ?? "prepaid",
//       }));
//       await order.save();
//     }
    
//     if (finalReceipt && Array.isArray(finalReceipt.sellers)) {
//       finalReceipt.sellers = finalReceipt.sellers.map((seller) => ({
//         ...seller,
//         isPaid: seller.isPaid ?? "prepaid",
//       }));
//       await finalReceipt.save();
//     }





//     // ✅ Set isPaid: true for seller with ID 999999
//     if (order && Array.isArray(order.sellers)) {
//       order.sellers = order.sellers.map((seller) => {
//         if (seller.seller?.id === 999999) {
//           return {
//             ...seller,
//             isPaid: "paid",
//           };
//         }
//         return seller;
//       });

//       // Save the updated order with modified sellers
//       await order.save();
//     }

//     if (finalReceipt && Array.isArray(finalReceipt.sellers)) {
//       finalReceipt.sellers = finalReceipt.sellers.map((seller) => {
//         if (seller.seller?.id === 999999) {
//           return { ...seller, isPaid: "paid" };
//         }
//         return seller;
//       });
//       await finalReceipt.save();
//     }

//     // Delete the Cart from DB
//     await Cart.findOneAndDelete({ cart_id: reference_cart_id });

//     // Update FinalReceipt to set isPaid to true
//     await FinalReceipt.findOneAndUpdate(
//       { receipt_id, reference_cart_id },
//       { $set: { isPaid: "prepaid" } },
//       { new: true }
//     );

//     // Handle subscription products
//     const subscriptionsToAdd = {};

//     for (const seller of finalReceipt.sellers) {
//       for (const itemEntry of seller.items) {
//         const productId = itemEntry.item.productId;
//         if (productId.includes("subscription")) {
//           const now = new Date();
//           const oneMonthLater = new Date(now);
//           oneMonthLater.setMonth(now.getMonth() + 1);

//           subscriptionsToAdd[productId] = {
//             modelId: productId,
//             startDate: now,
//             expirationDate: oneMonthLater,
//           };
//         }
//       }
//     }

//     if (Object.keys(subscriptionsToAdd).length > 0) {
//       await UserAccounts.updateOne(
//         { userId: user_id },
//         {
//           $set: Object.fromEntries(
//             Object.entries(subscriptionsToAdd).map(([key, value]) => [
//               `subscriptions.${key}`, value
//             ])
//           )
//         }
//       );
//     }

//     return res.json({
//       status: "paid",
//       order: order,
//     });

//   } catch (error) {
//     console.error("Error checking payment status:", error);
//     res.status(500).json({ message: "Error checking payment status", error });
//   }
// };
// Add this to your routes file (e.g., userRoutes.js or paymentRoutes.js)
export const getWalletBalance = async (req, res) => {
  try {
    console.log('🔍 getWalletBalance called');
    console.log('Headers:', req.headers);
    console.log('Cookies:', req.cookies);
    
    // Try to get user_id, handle the case where it returns null
    let user_id;
    try {
      const result = getUserFromToken(req, res);
      user_id = result?.user_id;
    } catch (err) {
      console.error('Error getting user from token:', err);
    }
    
    console.log('User ID from token:', user_id);

    if (!user_id) {
      return res.status(403).json({ 
        message: "Unauthorized - No valid token found", 
        balance: 0 
      });
    }

    const userAccount = await UserMyAccount.findOne({ userId: user_id });
    console.log('User account found:', !!userAccount);
    console.log('Wallet balance:', userAccount?.wallet?.balance);

    const balanceW = userAccount?.wallet?.balance

    if (!userAccount) {
      return res.status(404).json({ 
        message: "User account not found",
        balance: 0 
      });
    }

    console.log(balanceW)

    return res.status(200).json({ 
      balance: balanceW,
    });

  } catch (error) {
    console.error("❌ Error fetching wallet balance:", error);
    return res.status(500).json({ 
      message: "Server error", 
      error: error.message,
      balance: 0 
    });
  }
};

// In your router file, add:
export const getPaymentLink = async (req, res) => {
  try {
    const { orderId } = req.body;
    const tokenData = getUserFromToken(req, res);
    if (!tokenData || !tokenData.user_id) {
      return res.status(401).json({ message: "Unauthorized: user not found" });
    }
    const user_id = tokenData.user_id;
    if (!orderId) {
      return res.status(400).json({ message: "orderId is required" });
    }

    let amount = 0;


      // 🎯 Full order payment
      const order = await OrderJ2B.findOne({ id: orderId, user_id }).lean();
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      amount = order.total_price || 0;
      if (order.total_discount) {
        amount -= order.total_discount;
      }
    

    // Generate link
    const link_id = uuidv4();
    const link_url = "http://localhost:3000/fake-gateway";

    const body = {
      user_id,
      order_id: orderId,
      amount_to_pay: amount,
    };

    const newPaymentLink = new PaymentLink({
      link_id,
      link_url,
      body: JSON.stringify(body),
    });

    await newPaymentLink.save();

    return res.json(newPaymentLink);
  } catch (error) {
    console.error("Error generating payment link:", error);
    res.status(500).json({ message: "Error generating payment link", error });
  }
};

export const getPaymentLinkWallet = async (req, res) => {
  try {
    const { depositData, gateway } = req.body;
    const { name, family, phone, amount } = depositData;



    const tokenData = getUserFromToken(req, res);
    if (!tokenData || !tokenData.user_id) {
      return res.status(401).json({ message: "Unauthorized: user not found" });
    }
    const user_id = tokenData.user_id;
    // ✅ Validate
    if (!amount || !gateway) {
      return res.status(400).json({ message: "amount and gatewayId are required" });
    }

    // Generate transactionId
    const transactionId = uuidv4();

    // Wallet gateway link
    const link_url = "http://localhost:3000/fake-gateway-wallet";

    // Build transaction body (include transactionId here too ✅)
    const body = {
      transactionId,
      user_id,
      name,
      family,
      phone,
      gateway: gateway.name,
      gateway,
      amount,
    };

    // Create a new Transaction in DB
    const newTransaction = new Transaction({
      transactionId,
      userId: user_id,
      gatewayName: gateway.name,
      amount,
      type: "deposit", // wallet deposit
      description: `Wallet deposit by ${name} ${family}`,
      status: "pending",
    });

    await newTransaction.save();

    // Response
    return res.json({
      link_id: transactionId,
      link_url,
      transaction: newTransaction,
      body,
    });
  } catch (error) {
    console.error("Error generating wallet payment link:", error);
    res.status(500).json({ message: "Error generating wallet payment link", error });
  }
};


export const paymentWebhook = async (req, res) => {
  try {
    console.log("Incoming webhook:", JSON.stringify(req.body));

    const { status, body } = req.body;

    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");

    // Validate webhook structure
    if (!status || !body) {
      return res.status(400).json({
        error: "Invalid webhook format. Expected: {status: 'OK'|'FAILED', body: {...}}"
      });
    }

    const { order_id, transaction_id, amount, user_id, sellerId, payment_method } = body;

    if (!order_id) {
      return res.status(400).json({ error: "order_id is required in webhook body" });
    }

    // Determine if this is a wallet payment
    const isWalletPayment = payment_method === 'wallet';
    const paymentType = isWalletPayment ? 'wallet' : 'gateway';

    if (status === "OK") {
      // 1️⃣ Find the order by order_id
      const order = await OrderJ2B.findOne({ id: order_id });

      if (!order) {
        console.error(`Order not found: ${order_id}`);
        return res.status(404).json({ error: `Order not found: ${order_id}` });
      }

      // 2️⃣ Update order items with payment info
      const updateFields = {
        isPaid: "paid",
        status: "processing",
        updatedAt: new Date(),
        transactionId: transaction_id,
        paidAmount: amount,
        payment_type: paymentType
      };

      // Add wallet transaction ID if it's a wallet payment
      if (isWalletPayment && transaction_id) {
        updateFields.payment_wallet_transactionid = transaction_id;
      }

      if (sellerId) {
        // Update specific seller's items
        await OrderItemJ2B.updateMany(
          { 
            order_id: order.id,
            supplier_id: sellerId
          },
          { $set: updateFields }
        );
      } else {
        // Update all items
        await OrderItemJ2B.updateMany(
          { order_id: order.id },
          { $set: updateFields }
        );
      }

      // 3️⃣ Check if all items are paid
      const unpaidItems = await OrderItemJ2B.countDocuments({
        order_id: order.id,
        isPaid: { $ne: "paid" }
      });

      // 4️⃣ Update main order
      const orderUpdateFields = {
        updatedAt: new Date(),
        lastTransactionId: transaction_id,
        payment_type: paymentType
      };

      // Add wallet transaction ID to main order if wallet payment
      if (isWalletPayment && transaction_id) {
        orderUpdateFields.payment_wallet_transactionid = transaction_id;
      }

      if (unpaidItems === 0) {
        // All items paid
        await OrderJ2B.updateOne(
          { id: order.id },
          { 
            $set: { 
              ...orderUpdateFields,
              isPaid: "paid",
              status: "processing",
              paymentCompletedAt: new Date()
            } 
          }
        );
      } else {
        // Partially paid
        await OrderJ2B.updateOne(
          { id: order.id },
          { 
            $set: { 
              ...orderUpdateFields,
              isPaid: "prepaid",
              status: "waiting"
            } 
          }
        );
      }

    } else if (status === "FAILED") {
      // Handle failed payment
      const order = await OrderJ2B.findOne({ id: order_id });
      
      if (order) {
        if (order.status === "pending") {
          await OrderJ2B.updateOne(
            { id: order.id },
            { 
              $set: { 
                status: "failed",
                updatedAt: new Date(),
                failureReason: body.error_message || "Payment failed",
                failedTransactionId: transaction_id
              } 
            }
          );
        }

        // Mark items as unpaid
        if (sellerId) {
          await OrderItemJ2B.updateMany(
            { 
              order_id: order.id,
              supplier_id: sellerId
            },
            { 
              $set: { 
                isPaid: "unpaid",
                status: "pending",
                updatedAt: new Date(),
                failureReason: body.error_message || "Payment failed"
              } 
            }
          );
        } else {
          await OrderItemJ2B.updateMany(
            { order_id: order.id },
            { 
              $set: { 
                isPaid: "unpaid",
                status: "pending",
                updatedAt: new Date(),
                failureReason: body.error_message || "Payment failed"
              } 
            }
          );
        }
      }
    }

    // Fetch related orders
    const relatedOrders = await OrderJ2B.find(
      { 
        isPaid: { $in: ["unpaid", "prepaid"] },
        status: { $in: ["pending", "rejected"] }
      },
      { id: 1, status: 1, isPaid: 1, payment_type: 1, _id: 0 }
    );

    // Webhook log
    const webhookLog = {
      orderId: order_id,
      status: status,
      webhookData: body,
      processedAt: new Date(),
      transactionId: transaction_id,
      amount: amount,
      sellerId: sellerId,
      userId: user_id,
      paymentType: paymentType
    };

    return res.status(200).json({ 
      success: true,
      message: `Webhook processed successfully for order ${order_id}`,
      orderId: order_id,
      status: status,
      transactionId: transaction_id,
      paymentType: paymentType,
      processedAt: new Date().toISOString(),
      relatedOrders: relatedOrders
    });

  } catch (error) {
    console.error("❌ Error processing payment webhook:", error);
    console.error("Webhook data that caused error:", JSON.stringify(req.body, null, 2));
    
    res.status(500).json({ 
      success: false,
      message: "Server Error", 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

export const paymentWebhookWallet = async (req, res) => {
  try {
    const { link_id, status } = req.body;

    // ✅ Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");

    if (!link_id || status !== "OK") {
      return res.status(400).json({ message: "Invalid link_id or status" });
    }

    // ✅ Find payment link
    const paymentLink = await PaymentLinkWallet.findOne({ link_id });

    if (!paymentLink) {
      return res.status(404).json({ message: "Payment link not found" });
    }

    // ✅ Prevent double-processing
    if (paymentLink.payment_status === "paid") {
      return res.status(200).json({ message: "Payment already processed" });
    }

    // ✅ Update payment link status
    paymentLink.payment_status = "paid";
    await paymentLink.save();

    const { user_id, payment_amount, gateway_id, payment_currency } = paymentLink;

    // Generate a random order_id
    const order_id = `payment_order_${Math.random().toString(36).substring(2, 10)}`;


    // ✅ Create PaymentWallet record
    await PaymentWallet.create({
      link_id,
      gateway_id,
      payment_amount,
      payment_currency,
      user_id,
      payment_status: "paid",
      order_id,
      paymentComment: "", // optional
    });

    // ✅ Find user account
    const userAccount = await UserMyAccount.findOne({ userId: user_id });

    if (!userAccount) {
      return res.status(404).json({ message: "User account not found" });
    }

    // ✅ Update wallet balance
    userAccount.wallet.balance += payment_amount;

    // ✅ Add to payment history
    const newTransaction = {
      transactionId: `txn_${Date.now()}`,
      date: new Date().toLocaleDateString("fa-IR"),
      amount: payment_amount,
      type: "deposit",
      typeDescriptionFa: "واریز به کیف پول",
      method: "online_gateway",
      methodDescriptionFa: "پرداخت آنلاین",
      description: "شارژ کیف پول از درگاه پرداخت",
    };
    userAccount.wallet.paymentHistory.push(newTransaction);

    // ✅ Update lastTransaction
    userAccount.wallet.lastTransaction = newTransaction;

    await userAccount.save();

    const redirectUrl = `http://localhost:3000/payment-statuscheck-wallet?order_id=${order_id}&status=OK`;
    return res.status(200).json({ redirectUrl });

  } catch (error) {
    console.error("Error processing payment webhook:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

