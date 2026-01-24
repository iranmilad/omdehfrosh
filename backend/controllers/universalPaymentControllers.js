import { v4 as uuidv4 } from 'uuid';
import getUserFromToken from "../libs/verifyToken.js";
import OrderJ2B from "../models/Orders_J2B.js";
import UserMyAccount from "../models/UserMyAccount.js";
import PaymentLink from "../models/PaymentLink.js";
import Transaction from "../models/Transaction.js";

// Universal Get Payment Link Controller
export const getUniversalPaymentLink = async (req, res) => {
  console.log('🟢 getUniversalPaymentLink called');
  console.log('🟢 Request body:', req.body);
  try {
    // Only extract required fields - phoneNumber is NOT used or accepted
    const { order_id, gateway, amount, payment_type } = req.body;
    // Support legacy 'geteway' for backward compatibility
    const geteway = gateway || req.body.geteway;

    // Get user from token
    const userInfo = getUserFromToken(req);
    console.log('🟢 User info:', userInfo);
    if (!userInfo || !userInfo.user_id) {
      console.log('❌ Unauthorized - no user info');
      return res.status(403).json({ message: "Unauthorized" });
    }
    const { user_id } = userInfo;
    console.log('🟢 User ID:', user_id);

    // Determine payment method: prioritize payment_type over gateway
    // If payment_type is provided, use it; otherwise fall back to gateway/geteway
    let paymentMethod;
    if (payment_type) {
      paymentMethod = payment_type;
      console.log('🟢 Using payment_type:', paymentMethod);
    } else {
      paymentMethod = gateway || geteway;
      if (!paymentMethod) {
        console.log('❌ No gateway or payment_type provided');
        return res.status(400).json({ message: "Gateway or payment_type is required" });
      }
      console.log('🟢 Using gateway:', paymentMethod);
    }
    
    // Map payment_type to gateway name for transaction record
    let gatewayName;
    if (payment_type === "cod") {
      gatewayName = "cod";
    } else if (payment_type === "wallet" && order_id) {
      gatewayName = "wallet";
    } else {
      // For wallet recharge or regular gateways, use gateway name
      gatewayName = gateway || geteway || payment_type;
    }
    
    console.log('🟢 Final Gateway Name:', gatewayName);

    let paymentAmount;
    let paymentType;
    let wallet_id; // Will be set from user_id for wallet payments

    // Check if COD payment (Cash on Delivery) or Wallet payment from order
    // Use payment_type if provided, otherwise check gateway name
    const isCODPayment = payment_type === "cod" || 
                         payment_type === "COD" ||
                         gatewayName === "cod" || 
                         gatewayName === "COD" || 
                         gatewayName === "نقدی" || 
                         gatewayName === "cash";
    const isWalletPaymentFromOrder = (payment_type === "wallet" && order_id) ||
                                     (gatewayName === "wallet" && order_id);
    
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

    // Create redirect URL (always listener URL)
    const baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://j2b.market'
      : 'http://localhost:3000';

    const redirect_url = `${baseUrl}/payment-listener`;

    // Determine gateway URL based on payment type
    let gatewayUrl;
    if (isCODPayment || isWalletPaymentFromOrder) {
      // For COD and wallet payments from order: redirect directly to listener (skip fake gateway)
      // Add success=true to indicate successful payment (COD/wallet are always successful when requested)
      gatewayUrl = `${redirect_url}?tried${Math.floor(Math.random() * 10000000)}&success=true`;
    } else {
      // For regular gateways: use fake gateway in dev, real gateway in production
      gatewayUrl = process.env.NODE_ENV === 'production'
        ? `https://gateway.${gatewayName}.com/payment` // Replace with actual gateway URL
        : 'http://localhost:3000/fake-gateway';
    }

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

// Verify Payment Controller
export const verifyPayment = async (req, res) => {
  try {
    console.log('🔍 verifyPayment called');
    console.log('📥 Request body:', req.body);
    
    const { link, body } = req.body;

    if (!link || !body) {
      console.error('❌ Missing link or body');
      return res.status(400).json({ 
        link: "/",
        message: "Link and body are required" 
      });
    }

    const { transactionId, user_id, amount, order_id, wallet_id, success: bodySuccess } = body;
    console.log('📋 Extracted data:', { transactionId, user_id, amount, order_id, wallet_id, bodySuccess });
    
    // Determine payment type - if no order_id, it's a wallet payment
    // wallet_id in body is optional (legacy support), we use user_id from body to find wallet account
    const isWalletPayment = !order_id;

    // Parse query params from link (format: j2b.market/?tried3637378&success=true)
    let success = null;
    try {
      // Handle both localhost and production URLs
      const url = link.startsWith('http') 
        ? new URL(link) 
        : new URL(`http://${link}`);
      const searchParams = url.searchParams;
      success = searchParams.get('success');
      console.log('🔍 Success from URL params:', success);
      
      // Also check if success is in the query string directly
      if (!success && link.includes('success=')) {
        const match = link.match(/success=([^&]+)/);
        if (match) {
          success = match[1];
          console.log('🔍 Success from regex match:', success);
        }
      }
    } catch (urlError) {
      console.error('❌ Error parsing URL:', urlError);
      // Try to extract success from link string directly
      if (link.includes('success=true')) {
        success = 'true';
        console.log('🔍 Success from string check (true)');
      } else if (link.includes('success=false')) {
        success = 'false';
        console.log('🔍 Success from string check (false)');
      }
    }
    
    // Also check if success is in the body (from fake gateway)
    if (!success && bodySuccess) {
      success = bodySuccess;
      console.log('🔍 Success from body:', success);
    }
    
    // Default to true if not specified (for testing)
    if (!success) {
      console.log('⚠️ No success parameter found, defaulting to true');
      success = 'true';
    }
    
    console.log('✅ Final success value:', success);

    console.log('🔍 Verifying payment:', { transactionId, success, order_id, wallet_id, isWalletPayment });

    // Find transaction in database
    const transaction = await Transaction.findOne({ transactionId });
    if (!transaction) {
      console.log('❌ Transaction not found:', transactionId);
      const responseData = {
        link: "/",
        message: "تراکنش یافت نشد."
      };
      
      console.log('❌ Returning transaction not found response:', responseData);
      return res.status(404).json(responseData);
    }

    // Check if payment was successful
    if (success !== 'true') {
      // Update transaction status to failed
      transaction.status = 'failed';
      await transaction.save();

      const responseData = {
        link: order_id ? `/account/orders/${order_id}` : "/account/wallet",
        message: `پرداخت شما با شماره تراکنش ${transactionId} ناموفق بود. لطفا مجددا تلاش کنید.`
      };
      
      console.log('❌ Returning payment failed response:', responseData);
      return res.status(200).json(responseData);
    }

    // Process successful payment
    // Update transaction status
    transaction.status = 'success';
    await transaction.save();

    if (order_id) {
      // Process order payment
      console.log('💳 Processing order payment:', order_id);
      
      const order = await OrderJ2B.findOne({ id: order_id, user_id });
      
      if (!order) {
        console.log('⚠️ Order not found, but payment verified');
        const responseData = {
          link: "/account/orders",
          message: `پرداخت شما با شماره تراکنش ${transactionId} موفق بوده است.`
        };
        
        console.log('✅ Returning order payment success (order not found) response:', responseData);
        return res.status(200).json(responseData);
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

        // Check if user has other unpaid orders
        const hasUnpaidOrders = await checkUserHasUnpaidOrders(user_id);
        const redirectLink = hasUnpaidOrders ? "/payment" : "/account/orders";

        const responseData = {
          link: redirectLink,
          message: `درخواست پرداخت در محل با موفقیت ثبت شد`
        };
        
        console.log('✅ Returning COD payment success response:', responseData);
        return res.status(200).json(responseData);
      }

      // Handle wallet payment from order (keep payment_type as "gateway", not "wallet")
      if (isWalletPaymentFromOrder) {
        console.log('💰 Processing wallet payment from order in verify');
        
        // Find user wallet account
        const userAccount = await UserMyAccount.findOne({ userId: user_id });
        if (!userAccount) {
          return res.status(404).json({
            link: "/account/orders",
            message: "کیف پول یافت نشد."
          });
        }

        // Check wallet balance
        const numericAmount = parseInt(amount) || 0;
        const walletBalance = userAccount.wallet?.balance || 0;
        if (walletBalance < numericAmount) {
          return res.status(400).json({
            link: "/account/wallet",
            message: `موجودی کیف پول کافی نیست. موجودی: ${walletBalance.toLocaleString()} تومان، مبلغ مورد نیاز: ${numericAmount.toLocaleString()} تومان`
          });
        }

        // Deduct from wallet
        userAccount.wallet.balance = walletBalance - numericAmount;
        
        // Add transaction to wallet history (amount is negative for purchase)
        const walletTransaction = {
          transactionId: transactionId,
          date: new Date().toLocaleDateString("fa-IR"),
          amount: -numericAmount, // Negative for deduction
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

        // Update order items for wallet payment (set payment_type as "wallet")
        const OrderItemJ2B = (await import("../models/OrderItemJ2B.js")).default;
        await OrderItemJ2B.updateMany(
          { order_id: order_id },
          {
            $set: {
              isPaid: "paid",
              status: "processing",
              updatedAt: new Date(),
              payment_type: "wallet"
            }
          }
        );

        // Check if all items are paid
        const unpaidItems = await OrderItemJ2B.countDocuments({
          order_id: order_id,
          isPaid: { $ne: "paid" }
        });

        // Update main order for wallet payment (set payment_type as "wallet")
        const orderUpdateFields = {
          updatedAt: new Date(),
          payment_type: "wallet"
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
        const UserModelForWallet = (await import("../models/User.js")).default;
        const userRecordForWallet = await UserModelForWallet.findOne({ userId: user_id });
        const walletOrderUserName = userRecordForWallet?.name || 'کاربر';

        // Check if user has other unpaid orders
        const hasUnpaidOrdersWallet = await checkUserHasUnpaidOrders(user_id);
        const redirectLinkWallet = hasUnpaidOrdersWallet ? "/payment" : "/account/orders";

        const responseData = {
          link: redirectLinkWallet,
          message: `آقای ${walletOrderUserName} پرداخت شما از کیف پول با موفقیت انجام شد.`
        };
        
        console.log('✅ Returning wallet payment from order success response:', responseData);
        return res.status(200).json(responseData);
      }

      // Handle regular gateway payment (melli, mellat, etc.)
      // Update order items
      const OrderItemJ2B = (await import("../models/OrderItemJ2B.js")).default;
      await OrderItemJ2B.updateMany(
        { order_id: order_id },
        {
          $set: {
            isPaid: "paid",
            status: "processing",
            updatedAt: new Date(),
            payment_type: "gateway"
          }
        }
      );

      // Check if all items are paid
      const unpaidItems = await OrderItemJ2B.countDocuments({
        order_id: order_id,
        isPaid: { $ne: "paid" }
      });

      // Update main order
      const orderUpdateFields = {
        updatedAt: new Date(),
        payment_type: "gateway"
      };

      if (unpaidItems === 0) {
        // All items paid
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
        // Partially paid
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
      const UserModelForOrder = (await import("../models/User.js")).default;
      const userRecordForOrder = await UserModelForOrder.findOne({ userId: user_id });
      const orderUserName = userRecordForOrder?.name || 'کاربر';

      // Check if user has other unpaid orders
      const hasUnpaidOrdersGateway = await checkUserHasUnpaidOrders(user_id);
      const redirectLinkGateway = hasUnpaidOrdersGateway ? "/payment" : "/account/orders";

      const responseData = {
        link: redirectLinkGateway,
        message: `آقای ${orderUserName} پرداخت شما با شماره تراکنش ${transactionId} موفق بوده است.`
      };
      
      console.log('✅ Returning order payment success response:', responseData);
      return res.status(200).json(responseData);
    }

    if (isWalletPayment) {
      // Process wallet payment - use user_id to find wallet account
      console.log('💰 Processing wallet payment for user_id:', user_id);
      
      // Find wallet account by userId (from token)
      const userAccount = await UserMyAccount.findOne({ userId: user_id });
      if (!userAccount) {
        console.log('❌ Wallet account not found for user_id:', user_id);
        return res.status(404).json({
          link: "/account/wallet",
          message: "کیف پول یافت نشد."
        });
      }
      
      // Update wallet balance
      const numericAmount = parseInt(amount) || 0;
      userAccount.wallet.balance = (userAccount.wallet.balance || 0) + numericAmount;
      
      // Add transaction to history
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

      // Get user info for message
      const UserModelForWallet = (await import("../models/User.js")).default;
      const userRecordForWallet = await UserModelForWallet.findOne({ userId: user_id });
      const walletUserName = userRecordForWallet?.name || 'کاربر';

      // Check if user has unpaid orders - if so, redirect to payment page
      const hasUnpaidOrdersDeposit = await checkUserHasUnpaidOrders(user_id);
      const redirectLinkDeposit = hasUnpaidOrdersDeposit ? "/payment" : "/account/wallet";

      const responseData = {
        link: redirectLinkDeposit,
        message: `آقای ${walletUserName} پرداخت شما با شماره تراکنش ${transactionId} موفق بوده است.`
      };
      
      console.log('✅ Returning wallet payment success response:', responseData);
      return res.status(200).json(responseData);
    }

    const responseData = {
      link: "/",
      message: "نوع تراکنش نامشخص است."
    };
    
    console.log('❌ Returning unknown transaction type response:', responseData);
    return res.status(400).json(responseData);

  } catch (error) {
    console.error("❌ Error in verifyPayment:", error);
    const responseData = {
      link: "/",
      message: "خطا در پردازش پرداخت. لطفا با پشتیبانی تماس بگیرید.",
      error: error.message
    };
    
    console.log('❌ Returning error response:', responseData);
    return res.status(500).json(responseData);
  }
};
