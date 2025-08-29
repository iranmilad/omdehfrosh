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
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the phone number is already registered
    const existingUser = await UserAccounts.findOne({ mobile }); // Fixed field reference
   
   
    if (existingUser) {
      return res.status(400).send()
    }

    // Count total users to assign a new ID
    const userCount = await UserAccounts.countDocuments();
    const userId = userCount + 1; // Assign a unique ID

    // Create new user with required fields
    const newUser = new UserAccounts({
      userId, // Use correct field name
      mobile,
      name,
      family,
      nationalCode,
      role: "user", // Default role: user
    });

    await newUser.save();

    // Generate JWT Token
    const token = generateToken(res, userId, newUser.role); // Use newUser._id


    // res.status(201).json({
    //   message: "خطایی رخ داده است",
    //   state: "error",
    //   errors: {
    //     name: "فقط کاراکترهای فارسی مجاز هستند",
    //     family: "از کاراکترهای فارسی استفاده شود",
    //     nationalCode: "شماره ملی نامعتبر است",
    //     mobile: "شماره موبایل نامعتبر است"
    //   },
    //   // userId: newUser.userId, // Send correct userId
    //   // token, // Send token in response
    // });

    
  

    res.status(201).json({
      message: "ثبت نام با موفقیت انجام شد",
      state: "ok",
      userId: newUser.userId, // Send correct userId
      // token, // Send token in response
    });




  } catch (error) {
    console.error("Error registering user:", error); // Log actual error
    res.status(500).json({ message: "Failed to process request", error: error.message });
  }
};


export const login = async (req, res) => {
  try {

    const { mobile, code } = req.body;


    // Verify SMS code
    const verificationResponse = await verifySMSCode(mobile, code);

    const user = await UserAccounts.findOne({ mobile }); // Assuming `mobile` is unique

    
    // if (!verificationResponse.success) {
    //   return res.status(400).json({ message: verificationResponse.message });
    // }

    // // After verification, find the user in the database

    // if (!user) {
    //   return res.status(400).json({ message: "User not found" });
    // }

    // // Check if the user is active (optional step depending on your requirements)
    // if (!user.isActive) {
    //   return res.status(400).json({ message: "User is not active" });
    // }

    // Generate JWT token after finding the user in the database
    const token = jwt.sign(
      { id: user.userId, role: user.role, name: user.nameEng }, 
      process.env.JWT_SECRET, 
      { expiresIn: '10h' } // Token expiration time
    );

    // Set cookie name dynamically based on user role
    const cookieName = user.role === 'master' ? 'user_master' : 'user';


    // Send the token as a cookie with dynamic name based on role
    // res.cookie(cookieName, token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production", // Secure cookie in production
    //   sameSite: "Strict",
    //   maxAge: 100 * 60 * 60 * 1000, // 100 hours
    //   path: "/",
    // });


    // Send the response with user data
    return res.json({
      message: "Login successful",
      user: { id: user.userId, role: user.role, status: user.isActive },
      [user.role === "master" ? "token_master" : "token"]: user.role === "master" ? token : token
    });

  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};


export const verifyUser = (req, res) => {
  const user = getUserFromToken(req);  // Get the full object or null

  if (!user || !user.user_id || !user.decoded) {
    return res.status(401).json({ valid: false, message: "Unauthorized" });
  }

  const { decoded } = user;

  try {
    return res.json({ valid: true, user: decoded });
  } catch (error) {
    return res.status(401).json({ valid: false, message: "Invalid or expired token" });
  }
};


export const verifyTokenMaster = (req, res) => {

  
  const {decoded, user_id} = getUserFromToken(req, res);  // This will handle token extraction and verification


  if (!user_id) return res.status(401).json({ valid: false, message: "No token provided" });

  try {
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return res.json({ valid: true, user: decoded });
  } catch (error) {
    return res.status(401).json({ valid: false, message: "Invalid or expired token" });
  }
};
