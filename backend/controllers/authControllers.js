import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import UserAccounts from '../models/User.js'
import dotenv from "dotenv";
import { verifySMSCode } from "../libs/verifySMSCode.js";
import { generateToken } from "../jwt/jwt_func.js";
import getUserFromToken from "../libs/verifyToken.js";
import OrderJ2B from '../models/Orders_J2B.js';
import OrderItemJ2B from '../models/OrderItemJ2B.js';
import NotificationTable from '../models/NotificationsTable.js';


dotenv.config();

export const signup = async (req, res) => {
  try {
    const { mobile, name, family, nationalCode } = req.body;

    // Validate input
    if (!mobile || !name || !family || !nationalCode) {
      return res.status(400).json({ 
        message: "همه فیلدها الزامی هستند",
        state: "error",
        errors: {
          mobile: !mobile ? "شماره موبایل الزامی است" : undefined,
          name: !name ? "نام الزامی است" : undefined,
          family: !family ? "نام خانوادگی الزامی است" : undefined,
          nationalCode: !nationalCode ? "کد ملی الزامی است" : undefined,
        }
      });
    }

    // Validate national code format
    if (!/^\d{10}$/.test(nationalCode)) {
      return res.status(400).json({ 
        message: "کد ملی نامعتبر است",
        state: "error",
        errors: {
          nationalCode: "کد ملی باید 10 رقم باشد"
        }
      });
    }

    // Validate mobile format
    const cleanMobile = mobile.replace(/\s+/g, "");
    if (!/^09\d{9}$/.test(cleanMobile)) {
      return res.status(400).json({ 
        message: "شماره موبایل نامعتبر است",
        state: "error",
        errors: {
          mobile: "شماره موبایل باید با 09 شروع شود و 11 رقم باشد"
        }
      });
    }

    // Check if the phone number is already registered
    const existingUser = await UserAccounts.findOne({ mobile: cleanMobile });
   
    if (existingUser) {
      return res.status(400).json({ 
        message: "این شماره موبایل قبلا ثبت شده است",
        state: "error",
        errors: {
          mobile: "این شماره موبایل قبلا ثبت شده است"
        }
      });
    }

    // Check if national code is already registered
    const existingNationalCode = await UserAccounts.findOne({ nationalCode });
   
    if (existingNationalCode) {
      return res.status(400).json({ 
        message: "این کد ملی قبلا ثبت شده است",
        state: "error",
        errors: {
          nationalCode: "این کد ملی قبلا ثبت شده است"
        }
      });
    }

    // Count total users to assign a new ID
    const userCount = await UserAccounts.countDocuments();
    const userId = userCount + 1;

    // Create new user with required fields
    const newUser = new UserAccounts({
      userId,
      mobile: cleanMobile,
      name,
      family,
      nationalCode,
      role: "user",
      isActive: false, // Will be activated after SMS verification
    });

    await newUser.save();

    // Generate JWT Token
    const token = generateToken(res, userId, newUser.role);

    // Return success response
    return res.status(201).json({
      message: "ثبت نام با موفقیت انجام شد",
      state: "ok",
      userId: newUser.userId,
      token: token
    });

  } catch (error) {
    console.error("Error registering user:", error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });
      
      return res.status(400).json({ 
        message: "خطا در اعتبارسنجی داده‌ها",
        state: "error",
        errors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: "این اطلاعات قبلا ثبت شده است",
        state: "error",
        errors: {
          [field]: `این ${field === 'mobile' ? 'شماره موبایل' : 'کد ملی'} قبلا ثبت شده است`
        }
      });
    }

    return res.status(500).json({ 
      message: "خطا در پردازش درخواست",
      state: "error",
      error: error.message 
    });
  }
};

export const login = async (req, res) => {
  try {
    const { mobile, code } = req.body;

    if (!mobile) {
      return res.status(400).json({
        message: "شماره موبایل الزامی است",
        state: "error",
      });
    }

    const cleanMobile = String(mobile).replace(/\s+/g, "");

    if (!/^09\d{9}$/.test(cleanMobile)) {
      return res.status(400).json({
        message: "شماره موبایل نامعتبر است",
        state: "error",
      });
    }

    const findUser = () => UserAccounts.findOne({ mobile: cleanMobile });

    if (!code) {
      const user = await findUser();

      if (!user) {
        return res.status(200).json({
          message: "User not found",
          state: "user_not_found",
          exists: false,
          user: null,
        });
      }

      return res.status(200).json({
        message: "User found",
        state: "ok",
        exists: true,
        user: { id: user.userId, role: user.role, status: user.isActive },
      });
    }

    const verificationResponse = await verifySMSCode(cleanMobile, code);

    if (!verificationResponse.success) {
      return res.status(400).json({
        message: verificationResponse.message,
        state: "error",
      });
    }

    const user = await findUser();

    if (!user) {
      return res.status(200).json({
        message: "User not found",
        state: "user_not_found",
        exists: false,
        user: null,
      });
    }

    if (!user.isActive) {
      user.isActive = true;
      await user.save();
    }

    const token = jwt.sign(
      { id: user.userId, role: user.role, name: user.nameEng },
      process.env.JWT_SECRET,
      { expiresIn: "10h" }
    );

    return res.json({
      message: "Login successful",
      state: "ok",
      user: { id: user.userId, role: user.role, status: user.isActive },
      [user.role === "master" ? "token_master" : "token"]: token,
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ 
      message: "خطا در ورود",
      state: "error",
      error: error.message 
    });
  }
};


export const verifyUser = async (req, res) => {
  const user = getUserFromToken(req);

  if (!user || !user.user_id || !user.decoded) {
    return res.status(401).json({ 
      valid: false, 
      message: "Unauthorized" 
    });
  }

  const { decoded } = user;

  console.log("Decoded user:", decoded);

  try {
    // Fetch user data from database
    const userData = await UserAccounts.findOne({ userId: decoded.id });

    if (!userData) {
      return res.status(404).json({ 
        valid: false, 
        message: "User not found" 
      });
    }

    // Return token data with user name
    return res.json({ 
      valid: true, 
      user: {
        ...decoded,
        name: `${userData.name} ${userData.family}`,
        // family: userData.family,
        // fullName: `${userData.name} ${userData.family}`,
        // email: userData.email,
        // mobile: userData.mobile
      }
    });
  } catch (error) {
    console.error("Error verifying user:", error);
    return res.status(401).json({ 
      valid: false, 
      message: "Invalid or expired token" 
    });
  }
};

// Alternative: If you want minimal data (just name)
export const verifyUserMinimal = async (req, res) => {
  const user = getUserFromToken(req);

  if (!user || !user.user_id || !user.decoded) {
    return res.status(401).json({ 
      valid: false, 
      message: "Unauthorized" 
    });
  }

  const { decoded } = user;

  try {
    // Fetch only name and family from database
    const userData = await UserAccounts.findOne(
      { userId: decoded.id },
      { name: 1, family: 1, _id: 0 }
    );

    if (!userData) {
      return res.status(404).json({ 
        valid: false, 
        message: "User not found" 
      });
    }

    return res.json({ 
      valid: true, 
      user: {
        ...decoded,
        name: userData.name,
        family: userData.family
      }
    });
  } catch (error) {
    console.error("Error verifying user:", error);
    return res.status(401).json({ 
      valid: false, 
      message: "Invalid or expired token" 
    });
  }
};

export const verifyTokenMaster = (req, res) => {
  const tokenData = getUserFromToken(req, res);
  if (!tokenData || !tokenData.user_id) {
    return res.status(401).json({
      valid: false,
      message: "No token provided"
    });
  }
  const { decoded, user_id } = tokenData;

  try {
    return res.json({
      valid: true,
      user: decoded
    });
  } catch (error) {
    return res.status(401).json({
      valid: false,
      message: "Invalid or expired token"
    });
  }
};

// Combined endpoint that returns user verification + cart + notifications in ONE request
export const getUserInitialData = async (req, res) => {
  try {

    const s = req.body


    console.log(JSON.stringify(s));


    const user = getUserFromToken(req);

    if (!user || !user.user_id || !user.decoded) {
      return res.status(401).json({
        valid: false,
        message: "Unauthorized",
        user: null,
        cart: [],
        total: 0,
        notificationsCount: 0
      });
    }

    const { decoded, user_id } = user;

    // Fetch user data from database
    const userData = await UserAccounts.findOne({ userId: decoded.id });

    if (!userData) {
      return res.status(404).json({
        valid: false,
        message: "User not found",
        user: null,
        cart: [],
        total: 0,
        notificationsCount: 0
      });
    }

    // Prepare user object
    const userObject = {
      ...decoded,
      name: `${userData.name} ${userData.family}`,
      email: userData.email,
      mobile: userData.mobile,
    };

    // Fetch cart data
    let cartItems = [];
    let totalAmount = 0;

    const basketOrders = await OrderJ2B.find({
      user_id: user_id.toString(),
      status: "basket"
    });

    if (basketOrders && basketOrders.length > 0) {
      for (const basketOrder of basketOrders) {
        const orderItems = await OrderItemJ2B.find({ order_id: basketOrder.id });

        if (orderItems && orderItems.length > 0) {
          for (const orderItem of orderItems) {
            const itemData = {
              id: orderItem.product_id,
              title: orderItem.product_name,
              count: orderItem.count,
              seller: orderItem.seller,
              combinationsID: orderItem.combinationsID,
              attributes: orderItem.attributes || [],
              price: {
                regularPrice: orderItem.unit_price || 0,
                discountedPrice: orderItem.unit_price || 0,
                discountPercent: orderItem.discount_percent || 0
              },
              images: orderItem.images || []
            };

            cartItems.push(itemData);
            totalAmount += (orderItem.unit_price || 0) * (orderItem.count || 0);
          }
        }
      }
    }

    // Fetch unread notifications count
    let notificationsCount = 0;

    const query = {
      isRead: false,
      $and: [
        {
          $or: [
            { userId: user_id },
            { userId: { $exists: false } },
            { userId: null },
            { userId: undefined }
          ]
        },
        {
          $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: null },
            { expiresAt: { $gte: new Date() } }
          ]
        }
      ]
    };

    notificationsCount = await NotificationTable.countDocuments(query);

    // Return combined response
    return res.json({
      valid: true,
      user: userObject,
      cart: cartItems,
      total: totalAmount,
      notificationsCount: notificationsCount
    });

  } catch (error) {
    console.error("Error in getUserInitialData:", error);
    return res.status(500).json({
      valid: false,
      message: "Internal server error",
      user: null,
      cart: [],
      total: 0,
      notificationsCount: 0
    });
  }
};