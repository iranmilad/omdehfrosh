import { generateToken } from "../jwt/jwt_func.js";
import jwt from "jsonwebtoken";
import UserMessage from "../models/UserMessage.js";
import getUserFromToken from "../libs/verifyToken.js";


export const getAllUserMessages = async (req, res) => {
  try {

    
    const {user_id} = getUserFromToken(req, res);  // This will handle token extraction and verification

    const userMessages = await UserMessage.findOne({ userId: user_id });
    if (!userMessages) {
      return res.status(404).json({ message: "UserMessage not found", UserMessages: [] });
    }

  

    res.status(200).json({message: "OK", userMessages: userMessages});
  } catch (error) {
    console.error("Error fetching final receipt:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};