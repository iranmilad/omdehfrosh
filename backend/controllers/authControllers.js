import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import UserAccounts from '../models/User.js'
import dotenv from "dotenv";
import { verifySMSCode } from "../libs/verifySMSCode.js";
import { generateToken } from "../jwt/jwt_func.js";
import getUserFromToken from "../libs/verifyToken.js";



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

    // Verify SMS code using the imported function
    const verificationResponse = await verifySMSCode(mobile, code);

    // Check if verification failed
    if (!verificationResponse.success) {
      return res.status(400).json({ 
        message: verificationResponse.message,
        state: "error"
      });
    }

    // After successful verification, find the user in the database
    const user = await UserAccounts.findOne({ mobile });

    if (!user) {
      return res.status(400).json({ 
        message: "کاربر یافت نشد",
        state: "error"
      });
    }

    // Activate user on first successful login
    if (!user.isActive) {
      user.isActive = true;
      await user.save();
    }

    // Generate JWT token after successful verification and user validation
    const token = jwt.sign(
      { id: user.userId, role: user.role, name: user.nameEng }, 
      process.env.JWT_SECRET, 
      { expiresIn: '10h' }
    );

    // Send the response with user data
    return res.json({
      message: "ورود موفقیت‌آمیز بود",
      state: "ok",
      user: { id: user.userId, role: user.role, status: user.isActive },
      [user.role === "master" ? "token_master" : "token"]: token
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
  const {decoded, user_id} = getUserFromToken(req, res);

  if (!user_id) {
    return res.status(401).json({ 
      valid: false, 
      message: "No token provided" 
    });
  }

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