import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import UserAccounts from '../models/User.js'
import dotenv from "dotenv";
import { verifySMSCode } from "../libs/verifySMSCode.js"; // Keep this import
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
    const existingUser = await UserAccounts.findOne({ mobile });
   
    if (existingUser) {
      return res.status(400).send()
    }

    // Count total users to assign a new ID
    const userCount = await UserAccounts.countDocuments();
    const userId = userCount + 1;

    // Create new user with required fields
    const newUser = new UserAccounts({
      userId,
      mobile,
      name,
      family,
      nationalCode,
      role: "user", // Default role: user
    });

    await newUser.save();

    // Generate JWT Token
    const token = generateToken(res, userId, newUser.role);

    res.status(201).json({
      message: "ثبت نام با موفقیت انجام شد",
      state: "ok",
      userId: newUser.userId,
    });

  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Failed to process request", error: error.message });
  }
};

// REMOVED THE DUPLICATE FUNCTION - Using the imported one instead

// Fixed login function
export const login = async (req, res) => {
  try {
    const { mobile, code } = req.body;

    // Verify SMS code using the imported function
    const verificationResponse = await verifySMSCode(mobile, code);

    // Check if verification failed
    if (!verificationResponse.success) {
      return res.status(400).json({ message: verificationResponse.message });
    }

    // After successful verification, find the user in the database
    const user = await UserAccounts.findOne({ mobile });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check if the user is active
    if (!user.isActive) {
      return res.status(400).json({ message: "User is not active" });
    }

    // Generate JWT token after successful verification and user validation
    const token = jwt.sign(
      { id: user.userId, role: user.role, name: user.nameEng }, 
      process.env.JWT_SECRET, 
      { expiresIn: '10h' }
    );

    // Send the response with user data
    return res.json({
      message: "Login successful",
      user: { id: user.userId, role: user.role, status: user.isActive },
      [user.role === "master" ? "token_master" : "token"]: token
    });

  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

export const verifyUser = (req, res) => {
  const user = getUserFromToken(req);

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
  const {decoded, user_id} = getUserFromToken(req, res);

  if (!user_id) return res.status(401).json({ valid: false, message: "No token provided" });

  try {
    return res.json({ valid: true, user: decoded });
  } catch (error) {
    return res.status(401).json({ valid: false, message: "Invalid or expired token" });
  }
};