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
dotenv.config();

const generateRequestId = () => {
  const randomNum = Math.floor(Math.random() * 1000000); // Up to 6 digits
  return `req_${randomNum}`;
};


export const getPaymentLink = async (req, res) => {
  try {
    
    const { receipt_id, reference_cart_id } = req.body;


    const { user_id } = getUserFromToken(req, res);  // This will handle token extraction and verification
    

    if (!user_id) {
      return res.status(403).json({ message: "Unauthorized" });

    }


    const userId = user_id

    // Validate cartfinalreceipt data
    if ( !receipt_id || !reference_cart_id) {
      return res.status(400).json({ message: "Invalid cart final receipt data" });
    }

    const gateway_id = 1; // Always 1

    // Check if a payment link already exists
    let existingPaymentLink = await PaymentLink.findOne({
      receipt_id: receipt_id,
      reference_cart_id: reference_cart_id,
      gateway_id,
    });

    if (existingPaymentLink) {
      return res.json({
        message: "Payment link already exists",
        status: true,
        payment_link: existingPaymentLink.link_url,
        body: existingPaymentLink.body,
        link_id: existingPaymentLink.link_id,
        receipt_id: existingPaymentLink.receipt_id,
        // authority_id: existingPaymentLink.authority_id,
        gateway_id: existingPaymentLink.gateway_id,
      });
    }

    // Generate unique IDs
    const link_id = `pay_${Math.random().toString(36).substring(2, 12)}`;
    // const authority_id = `A${crypto.randomBytes(15).toString("hex").toUpperCase().slice(0, 25)}`;

    // const referral_link = `${process.env.BASE_URL}/payment-checkstatus`;
    

    const body = 'amount=5000'

    const callback_url = `http://localhost:5000/api/payment/paymentwebhook?receipt_id=${receipt_id}?status=ok`;

    const cartFinalReceiptDb = await FinalReceipt.findOne({
      receipt_id: receipt_id,
      reference_cart_id: reference_cart_id,
      user_id: userId
    });


    // Generate the payment URL
    // const payment_url = `https://payment-provider.com/checkout?amount=${cartfinalreceipt.totalPriceToPay}&currency=USD&receipt_id=${cartfinalreceipt.receipt_id}&user_id=${userId}&link_id=${link_id}&authority_id=${authority_id}&referral_link=${referral_link}&gateway_id=${gateway_id}`;
    
    const payment_url = `https://payment-provider.com/checkout`;

    // Create a new PaymentLink document
    const newPaymentLink = new PaymentLink({
      link_id,
      // authority_id,
      link_url: payment_url,
      payment_amount: cartFinalReceiptDb.totalPriceToPay,
      payment_currency: 'USD',
      user_id: userId,
      body: body,
      receipt_id: cartFinalReceiptDb.receipt_id,
      reference_cart_id: cartFinalReceiptDb.reference_cart_id,
      callback_url,
      gateway_id,
    });

    // Save to DB and check for errors
    await newPaymentLink.save()
      

    // Return the payment link
    res.json({
      message: "ok",
      status: true,
      payment_link: payment_url,
      link_id,
      receipt_id: cartFinalReceiptDb.receipt_id,
      body,
      // authority_id,
      gateway_id,
    });

  } catch (error) {
    console.error("Error generating payment link:", error);
    res.status(500).json({ message: "Error generating payment link", error });
  }
};




export const walletWithdraw = async (req, res) => {
  try {
    const { user_id } = getUserFromToken(req, res);

    if (!user_id) {
      return res.status(403).json({ message: "Unauthorized" });
    }


    const userAccount = await UserMyAccount.findOne({ userId: user_id });

    if (!userAccount) {
      return res.status(404).json({ message: "User account not found" });
    }

    if (userAccount.phoneNumber !== withdrawData.phone) {
      return res.status(400).json({ message: "Phone number mismatch" });
    }

    // Create new pending withdrawal
    const newWithdraw = {
      requestId: generateRequestId(),
      date: "13/03/1400",
      amount: parseInt(withdrawData.amount, 10),
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
    const { user_id } = getUserFromToken(req, res);

    if (!user_id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { transferData } = req.body;
    const { senderPhone, receiverPhone, amount, note } = transferData;
    const numericAmount = Number(amount);


    // Fetch sender and receiver
    const sender = await UserMyAccount.findOne({ phoneNumber: senderPhone });
    const receiver = await UserMyAccount.findOne({ phoneNumber: receiverPhone });

    if (!sender || !receiver) {
      return res.status(404).json({ message: "Sender or receiver not found" });
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


export const checkPaymentStatusWallet = async (req, res) => {

  const { order_id } = req.body;


  try {
    // ✅ Validate input
    if (!order_id) {
      return res.status(400).json({ message: "Missing order_id" });
    }

    // ✅ Find payment by order_id
    const payment = await PaymentWallet.findOne({ order_id });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // ✅ Return found payment
    return res.status(200).json({ payment, status: "pending", message: "پرداخت موفق بود." });


  } catch (error) {
    console.error("Error checking payment status:", error);
    res.status(500).json({ message: "Error checking payment status", error });
  }
};



export const checkPaymentStatus = async (req, res) => {
  const { receiptId } = req.body;

  try {
    const paymentLink = await PaymentLink.findOne({ receipt_id: receiptId });

    if (!paymentLink) {
      return res.status(404).json({ message: "Payment link not found" });
    }

    const finalReceipt = await FinalReceipt.findOne({
      receipt_id: paymentLink.receipt_id,
      reference_cart_id: paymentLink.reference_cart_id,
    });

    if (!finalReceipt) {
      return res.status(404).json({ message: "Final receipt not found" });
    }

    const { user_id, totalPriceToPay, reference_cart_id, receipt_id } = finalReceipt;

    if (!user_id || !totalPriceToPay) {
      return res.status(400).json({ message: "Missing user_id or totalPriceToPay in FinalReceipt" });
    }

    const userAccount = await UserAccounts.findOne({ userId: user_id });

    if (!userAccount || !userAccount.address) {
      return res.status(404).json({ message: "User account or address not found" });
    }

    let order = await Order.findOne({ receipt_id, reference_cart_id });

    if (order) {
      order = await Order.findOneAndUpdate(
        { receipt_id, reference_cart_id },
        {
          $set: {
            isPaid: "prepaid",
            payment_link: paymentLink.link_url,
            payment_gateway: paymentLink.gateway_id,
            paid_at: new Date(),
            address: userAccount.address,
            name: `${userAccount.name} ${userAccount.family}`,
            mobile: userAccount.mobile,
          },
        },
        { new: true }
      );
    } else {
      const uniqueOrderId = `j2border${crypto.randomBytes(8).toString("hex")}`;

      const newOrder = new Order({
        order_id: uniqueOrderId,
        receipt_id,
        reference_cart_id,
        isPaid: "prepaid",
        paymentMethod: finalReceipt.paymentMethod,
        sellers: finalReceipt.sellers,
        totalPriceApply: finalReceipt.totalPriceApply,
        payment_link: paymentLink.link_url,
        payment_gateway: paymentLink.gateway_id,
        paid_at: new Date(),
        user_id,
        totalPriceToPay,
        address: userAccount.address,
        name: `${userAccount.name} ${userAccount.family}`,
        mobile: userAccount.mobile,
      });

      order = await newOrder.save();
    }


    if (order && Array.isArray(order.sellers)) {
      order.sellers = order.sellers.map((seller) => ({
        ...seller,
        isPaid: seller.isPaid ?? "prepaid",
      }));
      await order.save();
    }
    
    if (finalReceipt && Array.isArray(finalReceipt.sellers)) {
      finalReceipt.sellers = finalReceipt.sellers.map((seller) => ({
        ...seller,
        isPaid: seller.isPaid ?? "prepaid",
      }));
      await finalReceipt.save();
    }





    // ✅ Set isPaid: true for seller with ID 999999
    if (order && Array.isArray(order.sellers)) {
      order.sellers = order.sellers.map((seller) => {
        if (seller.seller?.id === 999999) {
          return {
            ...seller,
            isPaid: "paid",
          };
        }
        return seller;
      });

      // Save the updated order with modified sellers
      await order.save();
    }

    if (finalReceipt && Array.isArray(finalReceipt.sellers)) {
      finalReceipt.sellers = finalReceipt.sellers.map((seller) => {
        if (seller.seller?.id === 999999) {
          return { ...seller, isPaid: "paid" };
        }
        return seller;
      });
      await finalReceipt.save();
    }

    // Delete the Cart from DB
    await Cart.findOneAndDelete({ cart_id: reference_cart_id });

    // Update FinalReceipt to set isPaid to true
    await FinalReceipt.findOneAndUpdate(
      { receipt_id, reference_cart_id },
      { $set: { isPaid: "prepaid" } },
      { new: true }
    );

    // Handle subscription products
    const subscriptionsToAdd = {};

    for (const seller of finalReceipt.sellers) {
      for (const itemEntry of seller.items) {
        const productId = itemEntry.item.productId;
        if (productId.includes("subscription")) {
          const now = new Date();
          const oneMonthLater = new Date(now);
          oneMonthLater.setMonth(now.getMonth() + 1);

          subscriptionsToAdd[productId] = {
            modelId: productId,
            startDate: now,
            expirationDate: oneMonthLater,
          };
        }
      }
    }

    if (Object.keys(subscriptionsToAdd).length > 0) {
      await UserAccounts.updateOne(
        { userId: user_id },
        {
          $set: Object.fromEntries(
            Object.entries(subscriptionsToAdd).map(([key, value]) => [
              `subscriptions.${key}`, value
            ])
          )
        }
      );
    }

    return res.json({
      status: "paid",
      order: order,
    });

  } catch (error) {
    console.error("Error checking payment status:", error);
    res.status(500).json({ message: "Error checking payment status", error });
  }
};



export const getPaymentLinkWallet = async (req, res) => {
  try {
    const { depositData } = req.body;
    const { name, family, phone, amount, gatewayId } = depositData;


    // Validate input
    if (!name || !family || !phone || !amount || !gatewayId?.name || !gatewayId?.paymentMethod) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const payment_amount = parseFloat(amount);
    if (isNaN(payment_amount) || payment_amount <= 0) {
      return res.status(400).json({ message: "Invalid payment amount" });
    }

    const { user_id } = getUserFromToken(req, res);
    if (!user_id) return res.status(403).json({ message: "Unauthorized" });

    const gateway_id = 1;
    const payment_currency = "USD";

    // Look for existing pending link
    let paymentLink = await PaymentLinkWallet.findOne({
      user_id,
      gateway_id,
      payment_status: "pending",
    });

    // If no existing link, create one
    if (!paymentLink) {
      const link_id = `pay_${Math.random().toString(36).substring(2, 12)}`;
      const link_url = `https://payment-provider.com/checkout`;
      const body = `name=${encodeURIComponent(name)}&family=${encodeURIComponent(family)}&phone=${phone}&amount=${payment_amount}`;

      paymentLink = new PaymentLinkWallet({
        link_id,
        gateway_id,
        link_url,
        payment_amount,
        payment_currency,
        user_id,
        body,
        referral_link: null,
        payment_status: "pending",
      });

      await paymentLink.save();
    }

    return res.json({
      message: "ok",
      status: true,
      walletpaymentlink: paymentLink, // Always return full document
    });

  } catch (error) {
    console.error("Error generating wallet payment link:", error);
    res.status(500).json({ message: "Error generating wallet payment link", error });
  }
};


export const paymentWebhook = async (req, res) => {
  try {
    const { receiptId, receipt_id_seller, status } = req.body;


    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");

    if (receiptId && receipt_id_seller && status === "OK") {
      // ✅ Update FinalReceipt
      const updatedFinalReceipt = await FinalReceipt.findOneAndUpdate(
        { receipt_id: receiptId, "sellers.receipt_id_seller": receipt_id_seller },
        { $set: { "sellers.$.isPaid": "paid" } },
        { new: true }
      );

      // ✅ Update Order
      const updatedOrder = await Order.findOneAndUpdate(
        { receipt_id: receiptId, "sellers.receipt_id_seller": receipt_id_seller },
        { $set: { "sellers.$.isPaid": "paid" } },
        { new: true }
      );

      if (!updatedFinalReceipt || !updatedOrder) {
        return res.status(404).json({ message: "Receipt or Order or Seller not found" });
      }


    }

    const redirectUrl = `http://localhost:3000/payment-statuscheck?receiptId=${receiptId}&status=OK`;
    return res.status(200).json({ redirectUrl });

  } catch (error) {
    console.error("Error processing payment webhook:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
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

