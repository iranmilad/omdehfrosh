import db from "../db/db.js";
import UserPurchasedProducts from "../models/PurchasedProducts.js";
import { generateToken } from '../jwt/jwt_func.js';
import getUserFromToken from "../libs/verifyToken.js";


export const getPurchasedProducts = async (req, res) => {
  try {
    const { productId } = req.body;

    const {user_id} = getUserFromToken(req, res);  // This will handle token extraction and verification
      
    const userID = user_id; // Extract userID from the token
    
    // Validate inputs
    if (!userID || !productId) {
      return res.status(400).json({ message: "Missing userID or productId" });
    }

    // Find user by userID
    const user = await UserPurchasedProducts.findOne({ userId: userID });

    if (!user) {
      return res.json({ message: "No users found", users: [] });
    }

    // Filter purchased products by productId and return necessary fields for comments
    const filteredProducts = user.purchasedProducts
      .filter(product => product.product_id === productId)
      .map(product => ({ 
        productId: product.product_id,
      }));

    // Construct the user data to match the desired return format
    const users = [
      {
        userId: user.userId,
        purchased_products: filteredProducts
      }
    ];

    return res.json({
      message: "ok",
      users: users
    });
  } catch (error) {
    console.error("Error retrieving purchased products:", error);
    return res.status(500).json({ message: "Failed to process request", error: error.message });
  }
};


export const addPurchasedProducts = async (req, res) => {
  const { fakeUser } = req.body;

  try {
    // Ensure that the fakeUser object and purchasedProducts are valid
    if (!fakeUser || !fakeUser.userId || !Array.isArray(fakeUser.purchasedProducts) || fakeUser.purchasedProducts.length === 0) {
      return res.status(400).json({ message: "Invalid data provided" });
    }

    // Check if the user already exists in the database
    let user = await UserPurchasedProducts.findOne({ userId: fakeUser.userId });

    if (user) {
      // User exists, update the user's purchased products
      user.purchasedProducts = [...user.purchasedProducts, ...fakeUser.purchasedProducts];
      await user.save(); // Save the updated user data

      return res.status(200).json({ message: "Purchased products updated successfully" });
    } else {
      // User does not exist, create a new user and add the purchased products
      user = new UserPurchasedProducts({
        userId: fakeUser.userId,
        purchasedProducts: fakeUser.purchasedProducts, // Add the products directly to the user
      });
      await user.save(); // Save the new user

      return res.status(201).json({ message: "User and purchased products added successfully" });
    }
  } catch (error) {
    console.error("Error adding purchased products:", error);
    res.status(500).json({ message: "An error occurred while adding the purchased products" });
  }
};
