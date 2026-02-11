import { v4 as uuidv4 } from 'uuid';
import qs from 'qs';
import getUserFromToken from "../libs/verifyToken.js";
import OrderJ2B from "../models/Orders_J2B.js";
import UserMyAccount from "../models/UserMyAccount.js";
import PaymentLink from "../models/PaymentLink.js";
import Transaction from "../models/Transaction.js";

// One-time payment result store: transactionId -> { link, message }; frontend reads ?transactionId=&success= and POSTs to verify-payment to get result
const paymentResultStore = new Map();
const PAYMENT_RESULT_TTL_MS = 10 * 60 * 1000; // 10 minutes

function setPaymentResult(transactionId, payload) {
  const key = transactionId != null ? String(transactionId).trim() : '';
  if (!key) return;
  paymentResultStore.set(key, { ...payload, expires: Date.now() + PAYMENT_RESULT_TTL_MS });
  console.log('[PAYMENT] stored result for transactionId', key.slice(0, 12) + '...', 'store size', paymentResultStore.size);
}

function getPaymentResult(transactionId) {
  const key = transactionId != null ? String(transactionId).trim() : '';
  const entry = paymentResultStore.get(key);
  if (!entry) return null;
  if (entry.expires && Date.now() > entry.expires) return null;
  return { link: entry.link, message: entry.message };
}

function getAndDeletePaymentResult(transactionId) {
  const key = transactionId != null ? String(transactionId).trim() : '';
  const entry = paymentResultStore.get(key);
  paymentResultStore.delete(key);
  if (!entry) return null;
  if (entry.expires && Date.now() > entry.expires) return null;
  return { link: entry.link, message: entry.message };
}

function getBackendBaseUrl() {
  return process.env.BACKEND_BASE_URL || process.env.API_URL || 'http://localhost:5000';
}

function getFrontendBaseUrl() {
  return process.env.FRONTEND_BASE_URL || (process.env.NODE_ENV === 'production' ? 'https://j2b.market' : 'http://localhost:3000');
}

// Universal Get Payment Link Controller
export const getUniversalPaymentLink = async (req, res) => {
  console.log('🟢 getUniversalPaymentLink called');
  console.log('🟢 Request body:', req.body);
  try {
    // Only extract required fields - phoneNumber is NOT used or accepted
    const { order_id, gateway, amount } = req.body;
    // Support legacy 'geteway' for backward compatibility
    const geteway = gateway || req.body.geteway;
    // MODIFIED 2026-02-09 - Removed payment_type field - backend will determine from gateway name

    // Get user from token
    const userInfo = getUserFromToken(req);
    console.log('🟢 User info:', userInfo);
    if (!userInfo || !userInfo.user_id) {
      console.log('❌ Unauthorized - no user info');
      // MODIFIED 2026-02-07 - return 401 when token invalid so frontend shows relogin modal
      return res.status(401).json({ message: "Unauthorized: user not found" });
    }
    const { user_id } = userInfo;
    console.log('🟢 User ID:', user_id);

    // Determine payment method from gateway name only
    const paymentMethod = gateway || geteway;
    if (!paymentMethod) {
      console.log('❌ No gateway provided');
      return res.status(400).json({ message: "Gateway is required" });
    }
    console.log('🟢 Using gateway:', paymentMethod);
    
    // Map gateway name to transaction record
    let gatewayName = paymentMethod;
    
    console.log('🟢 Final Gateway Name:', gatewayName);

    let paymentAmount;
    let paymentType;
    let wallet_id; // Will be set from user_id for wallet payments

    // Check if COD payment (Cash on Delivery) or Wallet payment from order
    // Determine from gateway name
    const isCODPayment = gatewayName === "cod" || 
                         gatewayName === "COD" || 
                         gatewayName === "نقدی" || 
                         gatewayName === "cash";
    const isWalletPaymentFromOrder = gatewayName === "wallet" && order_id;
    
    // Determine payment type based on provided parameters
    // For wallet recharge: { amount, gateway } (any gateway name) - wallet_id is derived from user token
    // For order payment: { order_id, gateway } where gateway can be "wallet", "cod", or gateway name
    if (amount && !order_id) {
      // Wallet recharge payment - amount without order_id indicates wallet recharge
      console.log('🟢 Payment type: wallet recharge');
      paymentAmount = parseFloat(amount);
      paymentType = "wallet";
      // Use user_id from token as wallet_id (backend will find UserMyAccount by userId)
      wallet_id = user_id;
      console.log('🟢 Wallet ID (from user_id):', wallet_id);
    } else if (order_id) {
      // Order payment
      console.log('🟢 Payment type: order payment');
      console.log('🟢 Order ID:', order_id);
      console.log('🟢 Gateway:', gatewayName);
      console.log('🟢 Is COD payment:', isCODPayment);
      console.log('🟢 Is Wallet payment from order:', isWalletPaymentFromOrder);

      // Look up order in database to get amount
      console.log('🟢 Looking for order in database:', order_id);
      const order = await OrderJ2B.findOne({ id: order_id, user_id });
      console.log('🟢 Order found:', order ? 'Yes' : 'No');
      if (!order) {
        console.log('❌ Order not found');
        return res.status(404).json({ message: "Order not found" });
      }
      console.log('🟢 Order total_price:', order.total_price);
      paymentAmount = order.total_price || 0;
      if (order.total_discount) {
        paymentAmount -= order.total_discount;
      }
      paymentType = "order";
      
      // COD and wallet payments from order will be processed in verify-payment route
      // Just continue to create transaction and return link/body (no immediate processing)
    } else {
      console.log('❌ Invalid request: need either (order_id + gateway) or (amount + gateway)');
      return res.status(400).json({
        message: "Invalid request. For wallet: {amount, gateway}. For order: {order_id, gateway}"
      });
    }

    // Generate unique transaction ID
    const transactionId = uuidv4();

    const frontendBaseUrl = getFrontendBaseUrl();
    const redirect_url = `${frontendBaseUrl}/payment-listener`;

    // All payments: user is POSTed to /api/fakegateway; fakegateway reads body and POSTs to /api/payment-listener
    const gatewayUrl = `${getBackendBaseUrl()}/api/fakegateway`;

    // Create body to send to gateway (exact format as specified)
    const paymentBody = {
      transactionId,
      user_id,
      amount: String(paymentAmount), // Convert to string as specified
      redirect_url
    };

    // Add order_id for order payments (wallet payments use user_id from token)
    if (paymentType === "order") {
      paymentBody.order_id = order_id;
    }

    // Save transaction to database
    const newTransaction = new Transaction({
      transactionId,
      userId: user_id,
      gatewayName: gatewayName,
      amount: paymentAmount,
      type: paymentType === "wallet" ? "deposit" : "deposit", // Transaction model only has deposit/withdraw
      description: paymentType === "wallet" 
        ? `Wallet deposit - ${amount}` 
        : `Order payment - Order ${order_id}`,
      status: "pending"
    });

    await newTransaction.save();

    // Save payment link to database
    const linkId = `link_${uuidv4()}`;
    const newPaymentLink = new PaymentLink({
      link_id: linkId,
      link_url: gatewayUrl,
      body: JSON.stringify(paymentBody),
      transactionId: transactionId
    });

    await newPaymentLink.save();

    // Return response (exact format as specified)
    const responseData = {
      link: gatewayUrl,
      body: paymentBody
    };
    
    console.log('✅ Sending response:', JSON.stringify(responseData, null, 2));
    console.log('🔗 Response link:', gatewayUrl);
    console.log('📄 Response body:', JSON.stringify(paymentBody, null, 2));
    
    return res.status(200).json(responseData);

  } catch (error) {
    console.error("Error in getUniversalPaymentLink:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Helper function to check if user has unpaid orders
const checkUserHasUnpaidOrders = async (user_id) => {
  try {
    const unpaidOrdersCount = await OrderJ2B.countDocuments({
      user_id: user_id,
      isPaid: "unpaid"
    });
    console.log(`🔍 User ${user_id} has ${unpaidOrdersCount} unpaid orders`);
    return unpaidOrdersCount > 0;
  } catch (error) {
    console.error('Error checking unpaid orders:', error);
    return false;
  }
};

/**
 * Core verification logic: process payment with body and success flag. Returns { link, message } and optional httpStatus.
 * Used by both POST /verify-payment (legacy) and POST /api/payment-listener.
 */
async function runVerifyLogic(body, success) {
  const { transactionId, user_id, amount, order_id, wallet_id } = body || {};
  const isWalletPayment = !order_id;

  const transaction = await Transaction.findOne({ transactionId });
  if (!transaction) {
    return { link: "/", message: "تراکنش یافت نشد.", httpStatus: 404 };
  }

  if (success !== 'true') {
    transaction.status = 'failed';
    await transaction.save();
    return {
      link: order_id ? `/account/orders` : "/account/wallet",
      message: `پرداخت شما با شماره تراکنش ${transactionId} ناموفق بود. لطفا مجددا تلاش کنید.`
    };
  }

  transaction.status = 'success';
  await transaction.save();

  if (order_id) {
    const order = await OrderJ2B.findOne({ id: order_id, user_id });
    if (!order) {
      return {
        link: "/account/orders",
        message: `پرداخت شما با شماره تراکنش ${transactionId} موفق بوده است.`
      };
    }

      // Determine payment type from transaction gateway name
      const isCODPayment = transaction.gatewayName === "cod" || 
                           transaction.gatewayName === "COD" || 
                           transaction.gatewayName === "نقدی" || 
                           transaction.gatewayName === "cash";
      const isWalletPaymentFromOrder = transaction.gatewayName === "wallet" && order_id;

      // Handle COD payment
      if (isCODPayment) {
        console.log('💰 Processing COD payment in verify');
        
        // Update order items for COD
        const OrderItemJ2B = (await import("../models/OrderItemJ2B.js")).default;
        await OrderItemJ2B.updateMany(
          { order_id: order_id },
          {
            $set: {
              isPaid: "paid",
              status: "processing",
              updatedAt: new Date(),
              payment_type: "cod"
            }
          }
        );

        // Check if all items are paid
        const unpaidItems = await OrderItemJ2B.countDocuments({
          order_id: order_id,
          isPaid: { $ne: "paid" }
        });

        // Update main order for COD
        const orderUpdateFields = {
          updatedAt: new Date(),
          payment_type: "cod"
        };

        if (unpaidItems === 0) {
          await OrderJ2B.updateOne(
            { id: order_id },
            {
              $set: {
                ...orderUpdateFields,
                isPaid: "paid",
                status: "processing"
              }
            }
          );
        } else {
          await OrderJ2B.updateOne(
            { id: order_id },
            {
              $set: {
                ...orderUpdateFields,
                isPaid: "prepaid",
                status: "waiting"
              }
            }
          );
        }

        // Get user info for message
        const UserModelForCOD = (await import("../models/User.js")).default;
        const userRecordForCOD = await UserModelForCOD.findOne({ userId: user_id });
        const codUserName = userRecordForCOD?.name || 'کاربر';

    const hasUnpaidOrders = await checkUserHasUnpaidOrders(user_id);
    const redirectLink = hasUnpaidOrders ? "/payment" : "/account/orders";
    return { link: redirectLink, message: `درخواست پرداخت در محل با موفقیت ثبت شد` };
  }

  if (transaction.gatewayName === "wallet" && order_id) {
    const userAccount = await UserMyAccount.findOne({ userId: user_id });
    if (!userAccount) {
      return { link: "/account/orders", message: "کیف پول یافت نشد.", httpStatus: 404 };
    }
    const numericAmount = parseInt(amount) || 0;
    const walletBalance = userAccount.wallet?.balance || 0;
    if (walletBalance < numericAmount) {
      return {
        link: "/account/wallet",
        message: `موجودی کیف پول کافی نیست. موجودی: ${walletBalance.toLocaleString()} تومان، مبلغ مورد نیاز: ${numericAmount.toLocaleString()} تومان`,
        httpStatus: 400
      };
    }

    userAccount.wallet.balance = walletBalance - numericAmount;
    const walletTransaction = {
      transactionId: transactionId,
      date: new Date().toLocaleDateString("fa-IR"),
      amount: -numericAmount,
      type: "purchase",
      typeDescriptionFa: "خرید از کیف پول",
      method: "wallet",
      methodDescriptionFa: "پرداخت از کیف پول",
      description: `پرداخت سفارش ${order_id}`,
    };
    userAccount.wallet.paymentHistory = userAccount.wallet.paymentHistory || [];
    userAccount.wallet.paymentHistory.push(walletTransaction);
    userAccount.wallet.lastTransaction = walletTransaction;
    await userAccount.save();

    const OrderItemJ2B = (await import("../models/OrderItemJ2B.js")).default;
    await OrderItemJ2B.updateMany(
      { order_id: order_id },
      { $set: { isPaid: "paid", status: "processing", updatedAt: new Date(), payment_type: "wallet" } }
    );
    const unpaidItemsWallet = await OrderItemJ2B.countDocuments({ order_id: order_id, isPaid: { $ne: "paid" } });
    const orderUpdateFieldsWallet = { updatedAt: new Date(), payment_type: "wallet" };
    if (unpaidItemsWallet === 0) {
      await OrderJ2B.updateOne({ id: order_id }, { $set: { ...orderUpdateFieldsWallet, isPaid: "paid", status: "processing" } });
    } else {
      await OrderJ2B.updateOne({ id: order_id }, { $set: { ...orderUpdateFieldsWallet, isPaid: "prepaid", status: "waiting" } });
    }
    const UserModelForWallet = (await import("../models/User.js")).default;
    const userRecordForWallet = await UserModelForWallet.findOne({ userId: user_id });
    const walletOrderUserName = userRecordForWallet?.name || 'کاربر';
    const hasUnpaidOrdersWallet = await checkUserHasUnpaidOrders(user_id);
    const redirectLinkWallet = hasUnpaidOrdersWallet ? "/payment" : "/account/orders";
    return { link: redirectLinkWallet, message: `آقای ${walletOrderUserName} پرداخت شما از کیف پول با موفقیت انجام شد.` };
  }

  // Regular gateway payment (melli, mellat, etc.)
  const OrderItemJ2B = (await import("../models/OrderItemJ2B.js")).default;
  await OrderItemJ2B.updateMany(
    { order_id: order_id },
    { $set: { isPaid: "paid", status: "processing", updatedAt: new Date(), payment_type: "gateway" } }
  );
  const unpaidItemsGw = await OrderItemJ2B.countDocuments({ order_id: order_id, isPaid: { $ne: "paid" } });
  const orderUpdateFieldsGw = { updatedAt: new Date(), payment_type: "gateway" };
  if (unpaidItemsGw === 0) {
    await OrderJ2B.updateOne({ id: order_id }, { $set: { ...orderUpdateFieldsGw, isPaid: "paid", status: "processing" } });
  } else {
    await OrderJ2B.updateOne({ id: order_id }, { $set: { ...orderUpdateFieldsGw, isPaid: "prepaid", status: "waiting" } });
  }
  const UserModelForOrder = (await import("../models/User.js")).default;
  const userRecordForOrder = await UserModelForOrder.findOne({ userId: user_id });
  const orderUserName = userRecordForOrder?.name || 'کاربر';
  const hasUnpaidOrdersGateway = await checkUserHasUnpaidOrders(user_id);
  const redirectLinkGateway = hasUnpaidOrdersGateway ? "/payment" : "/account/orders";
  return { link: redirectLinkGateway, message: `آقای ${orderUserName} پرداخت شما با شماره تراکنش ${transactionId} موفق بوده است.` };
  }

  // Wallet recharge (no order_id)
  const userAccount = await UserMyAccount.findOne({ userId: user_id });
  if (!userAccount) {
    return { link: "/account/wallet", message: "کیف پول یافت نشد.", httpStatus: 404 };
  }
  const numericAmount = parseInt(amount) || 0;
  userAccount.wallet.balance = (userAccount.wallet.balance || 0) + numericAmount;
  const newTransaction = {
    transactionId: transactionId,
    date: new Date().toLocaleDateString("fa-IR"),
    amount: numericAmount,
    type: "deposit",
    typeDescriptionFa: "واریز به کیف پول",
    method: "online_gateway",
    methodDescriptionFa: "پرداخت آنلاین",
    description: "شارژ کیف پول از درگاه پرداخت",
  };
  userAccount.wallet.paymentHistory = userAccount.wallet.paymentHistory || [];
  userAccount.wallet.paymentHistory.push(newTransaction);
  userAccount.wallet.lastTransaction = newTransaction;
  await userAccount.save();
  const UserModelForWallet = (await import("../models/User.js")).default;
  const userRecordForWallet = await UserModelForWallet.findOne({ userId: user_id });
  const walletUserName = userRecordForWallet?.name || 'کاربر';
  const hasUnpaidOrdersDeposit = await checkUserHasUnpaidOrders(user_id);
  const redirectLinkDeposit = hasUnpaidOrdersDeposit ? "/payment" : "/account/wallet";
  return { link: redirectLinkDeposit, message: `آقای ${walletUserName} پرداخت شما با شماره تراکنش ${transactionId} موفق بوده است.` };
}

// GET /universal-payment/verify-payment?transactionId=xxx&success=true → return { link, message } (same result until TTL expires)
// POST /universal-payment/verify-payment body { link, body } → run verification, return { message, link } (legacy)
export const verifyPaymentGet = async (req, res) => {
  try {
    const transactionId = req.query?.transactionId != null ? String(req.query.transactionId).trim() : '';
    console.log('[PAYMENT] GET verify-payment', { transactionId: transactionId ? transactionId.slice(0, 12) + '...' : '', storeSize: paymentResultStore.size });
    if (!transactionId) {
      return res.status(400).json({ message: "transactionId لازم است.", link: "/" });
    }
    const payload = getPaymentResult(transactionId);
    if (!payload) {
      console.warn('[PAYMENT] no result for transactionId', transactionId.slice(0, 12) + '...');
      return res.status(404).json({ message: "نتیجه پرداخت یافت نشد یا منقضی شده است.", link: "/" });
    }
    return res.status(200).json({ message: payload.message, link: payload.link });
  } catch (error) {
    console.error("Error in verifyPaymentGet:", error);
    return res.status(500).json({ link: "/", message: "خطا در پردازش پرداخت. لطفا با پشتیبانی تماس بگیرید." });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const body = req.body || {};
    const { link, body: verifyBody } = body;
    if (!link || !verifyBody) {
      return res.status(400).json({ link: "/", message: "برای POST، link و body لازم است." });
    }
    const successFromUrl = link.includes('success=false') ? 'false' : (link.includes('success=true') ? 'true' : null);
    const success = verifyBody.success ?? successFromUrl ?? 'true';
    const result = await runVerifyLogic(verifyBody, success);
    const status = result.httpStatus || 200;
    return res.status(status).json({ link: result.link, message: result.message });
  } catch (error) {
    console.error("Error in verifyPayment:", error);
    return res.status(500).json({ link: "/", message: "خطا در پردازش پرداخت. لطفا با پشتیبانی تماس بگیرید." });
  }
};

// POST /api/payment-listener: process payment, then redirect to frontend /payment-listener?transactionId=XXX&success=true|false
export const paymentListenerController = async (req, res) => {
  const frontendBaseUrl = getFrontendBaseUrl();
  try {
    let body = req.body;
    if (Buffer.isBuffer(req.body)) {
      const str = req.body.toString('utf8');
      try {
        body = JSON.parse(str);
      } catch {
        body = qs.parse(str);
      }
    }
    if (!body || typeof body !== 'object') {
      body = {};
    }
    const transactionId = (body.transactionId != null ? String(body.transactionId).trim() : null) || uuidv4();
    const successRaw = body.success ?? body.ResCode ?? body.resCode ?? 'true';
    const successNorm = String(successRaw).toLowerCase() === 'true' || successRaw === true || String(successRaw) === '0';
    const successStr = successNorm ? 'true' : 'false';
    const result = await runVerifyLogic(body, successStr);
    setPaymentResult(transactionId, { link: result.link, message: result.message });
    const redirectUrl = `${frontendBaseUrl}/payment-listener/?transactionId=${encodeURIComponent(transactionId)}&success=${successStr}`;
    console.log('[PAYMENT] payment-listener redirect', { transactionId: transactionId.slice(0, 12) + '...', redirectUrl: redirectUrl.slice(0, 80) + '...' });
    return res.redirect(302, redirectUrl);
  } catch (error) {
    console.error("Error in paymentListenerController:", error);
    let errBody = req.body;
    if (Buffer.isBuffer(errBody)) {
      try { errBody = JSON.parse(errBody.toString('utf8')); } catch { errBody = {}; }
    }
    const transactionId = (errBody && errBody.transactionId) || uuidv4();
    setPaymentResult(transactionId, { link: "/", message: "خطا در پردازش پرداخت. لطفا با پشتیبانی تماس بگیرید." });
    const redirectUrl = `${frontendBaseUrl}/payment-listener/?transactionId=${encodeURIComponent(transactionId)}&success=false`;
    return res.redirect(302, redirectUrl);
  }
};

// POST /api/fakegateway: receives POST body from frontend (after get-payment-link), forwards POST to /api/payment-listener, then redirects user to the same Location (React listener page)
export const fakeGatewayController = async (req, res) => {
  try {
    const body = req.body || {};
    const listenerUrl = `${getBackendBaseUrl()}/api/payment-listener`;
    const response = await fetch(listenerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      redirect: 'manual',
    });
    if (response.status === 302) {
      const location = response.headers.get('Location');
      if (location) return res.redirect(302, location);
    }
    const fallbackUrl = `${getFrontendBaseUrl()}/payment-listener`;
    return res.redirect(302, fallbackUrl);
  } catch (error) {
    console.error("Error in fakeGatewayController:", error);
    return res.redirect(302, `${getFrontendBaseUrl()}/payment-listener`);
  }
};
