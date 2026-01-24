import db from "../db/db.js";
import UserAccounts from '../models/User.js'
import { generateToken } from '../jwt/jwt_func.js'
import jwt from "jsonwebtoken";
import UserStockAlert from "../models/UserStockAlert.js";
import mongoose from "mongoose";
import { convertToGregorian } from "../libs/convertShamsi.js";
import moment from "jalali-moment";
import getUserFromToken from "../libs/verifyToken.js";
import UserMyAccount from "../models/UserMyAccount.js";
import js from "@eslint/js";

export const getUserInfo = async (req, res) => {
  try {


        const {user_id} = getUserFromToken(req, res);  // This will handle token extraction and verification
    

    const userId = user_id

    if (!userId) {
      return res.status(400).json({ message: "User Not Found" });
    }


    // Find user by mobile number
    const user = await UserAccounts.findOne({ userId: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    
    // if (user.birthday) {
    //   const persianBirthday = moment(user.birthday, 'YYYY-MM-DD').format('jYYYY/jMM/jDD');
    //   user.birthday = persianBirthday;
    // }

    
    res.status(200).json({
      message: "User info retrieved successfully",
      status: "ok",
      user
    });

  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Failed to update user", error: error.message });
  }
};


export const registerUser = async (req, res) => {
  try {
    const { mobile, name, family, nationalCode } = req.body;


    // Validate input
    if (!mobile || !name || !family || !nationalCode) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the phone number is already registered
    const existingUser = await UserAccounts.findOne({ mobile }); // Fixed field reference
    if (existingUser) {
      return res.status(400).json({ message: "Phone number already registered" });
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

    res.status(201).json({
      message: "User registered successfully",
      userId: newUser.userId, // Send correct userId
      token, // Send token in response
    });

  } catch (error) {
    console.error("Error registering user:", error); // Log actual error
    res.status(500).json({ message: "Failed to process request", error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    console.log(req.body)
    let userId;

    try {
      const { user_id } = getUserFromToken(req, res);
      userId = user_id;
    } catch (authError) {
      return res.status(401).send();
    }

    const { mobile, socialNumber, birthday } = req.body;
    const cleanedPhoneSocial = socialNumber ? socialNumber.replace(/\s+/g, "") : null;

    const user = await UserAccounts.findOne({ userId });
    if (!user) {
      return res.status(404).send(); // User not found
    }

    // --- 🗓 Convert birthday to Jalali (1355/02/23) before saving ---
    let birthdayJalali = user.birthday; // keep old if not provided
    if (birthday) {
      try {
        // If input is already Jalali (e.g., 1355/02/23), just keep it
        if (/^\d{4}\/\d{2}\/\d{2}$/.test(birthday)) {
          birthdayJalali = birthday;
        } else {
          // Assume Gregorian (YYYY-MM-DD) → convert to Jalali
          const m = moment(birthday, "YYYY-MM-DD");
          if (m.isValid()) {
            birthdayJalali = m.format("jYYYY/jMM/jDD");
          }
        }
      } catch (e) {
        console.error("Birthday conversion failed:", e);
      }
    }

    // Update user fields
    user.name = req.body.name ?? user.name;
    user.family = req.body.family ?? user.family;
    user.email = req.body.email ?? user.email;
    user.password = req.body.password ?? user.password;
    user.nationalCode = req.body.nationalCode ?? user.nationalCode;
    user.country = req.body.country ?? user.country;
    user.province = req.body.province ?? user.province;
    user.city = req.body.city ?? user.city;
    user.address = req.body.address ?? user.address;
    user.postalCode = req.body.postalCode ?? user.postalCode;
    user.socialNetworkName = req.body.socialName ?? user.socialNetworkName;
    user.socialNetworkMobile = cleanedPhoneSocial ?? user.socialNetworkMobile;
    user.birthday = birthdayJalali;
    user.updatedAt = new Date();

    await user.save();

    return res.status(200).json({
      message: "اطلاعات کاربری با موفقیت ویرایش شدند",
      state: "ok",
      status: "ok"
    });

  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({
      message: "خطا در ویرایش اطلاعات کاربری",
      error: error.message,
    });
  }
};

// Get all addresses for a user
export const getUserAddresses = async (req, res) => {
  try {
    const { user_id } = getUserFromToken(req, res);
    
    const user = await UserAccounts.findOne({ userId: user_id });
    if (!user) {
      return res.status(404).json({ message: "کاربر یافت نشد" });
    }

    return res.status(200).json({
      addresses: user.addresses || [],
      state: "ok"
    });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return res.status(500).json({
      message: "خطا در دریافت آدرس‌ها",
      error: error.message,
    });
  }
};

// Add a new address
export const addUserAddress = async (req, res) => {
  try {
    const { user_id } = getUserFromToken(req, res);
    const { 
      title, 
      name,
      family,
      mobile,
      nationalCode,
      province, 
      city, 
      address, 
      postalCode,
      isDefault 
    } = req.body;

    // Validation
    if (!title || !name || !family || !mobile || !province || !city || !address || !postalCode) {
      return res.status(400).json({
        message: "تمام فیلدهای آدرس الزامی است",
        state: "error"
      });
    }

    if (!/^\d{10}$/.test(postalCode.replace(/\s+/g, ""))) {
      return res.status(400).json({
        message: "کد پستی باید 10 رقم باشد",
        state: "error"
      });
    }

    // Validate nationalCode only if provided
    if (nationalCode && nationalCode.trim() !== '') {
      if (!/^\d{10}$/.test(nationalCode.replace(/\s+/g, ""))) {
        return res.status(400).json({
          message: "کد ملی باید 10 رقم باشد",
          state: "error"
        });
      }
    }

    const user = await UserAccounts.findOne({ userId: user_id });
    if (!user) {
      return res.status(404).json({ message: "کاربر یافت نشد" });
    }

    // Clean phone numbers
    const cleanedMobile = mobile ? mobile.replace(/\s+/g, "") : mobile;
    const cleanedPostalCode = postalCode ? postalCode.replace(/\s+/g, "") : postalCode;
    const cleanedNationalCode = (nationalCode && nationalCode.trim() !== '') ? nationalCode.replace(/\s+/g, "") : '';

    // If this is set as default, unset all other defaults
    if (isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    // Create new address
    const newAddress = {
      addressId: new mongoose.Types.ObjectId().toString(),
      title,
      name,
      family,
      mobile: cleanedMobile,
      nationalCode: cleanedNationalCode || undefined, // Only include if provided
      province,
      city,
      address,
      postalCode: cleanedPostalCode,
      isDefault: isDefault || user.addresses.length === 0, // First address is default
    };

    user.addresses.push(newAddress);
    await user.save();

    return res.status(200).json({
      message: "آدرس با موفقیت اضافه شد",
      address: newAddress,
      state: "ok"
    });
  } catch (error) {
    console.error("Error adding address:", error);
    return res.status(500).json({
      message: "خطا در افزودن آدرس",
      error: error.message,
    });
  }
};

// Update an address
export const updateUserAddress = async (req, res) => {
  try {
    const { user_id } = getUserFromToken(req, res);
    const { addressId } = req.params;
    const { 
      title,
      name,
      family,
      mobile,
      nationalCode,
      province, 
      city, 
      address, 
      postalCode,
      isDefault 
    } = req.body;
  

    const user = await UserAccounts.findOne({ userId: user_id });
    if (!user) {
      return res.status(404).json({ message: "کاربر یافت نشد" });
    }

    const addressIndex = user.addresses.findIndex(
      addr => addr.addressId === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({ 
        message: "آدرس یافت نشد",
        state: "error" 
      });
    }

    // If setting as default, unset all others
    if (isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    // Update address fields
    if (title) user.addresses[addressIndex].title = title;
    if (name) user.addresses[addressIndex].name = name;
    if (family) user.addresses[addressIndex].family = family;
    if (mobile) user.addresses[addressIndex].mobile = mobile.replace(/\s+/g, "");
    if (nationalCode !== undefined) {
      if (nationalCode && nationalCode.trim() !== '') {
        const cleanedNC = nationalCode.replace(/\s+/g, "");
        if (!/^\d{10}$/.test(cleanedNC)) {
          return res.status(400).json({
            message: "کد ملی باید 10 رقم باشد",
            state: "error"
          });
        }
        user.addresses[addressIndex].nationalCode = cleanedNC;
      } else {
        // Allow clearing nationalCode by setting it to empty
        user.addresses[addressIndex].nationalCode = undefined;
      }
    }
    if (province) user.addresses[addressIndex].province = province;
    if (city) user.addresses[addressIndex].city = city;
    if (address) user.addresses[addressIndex].address = address;
    if (postalCode) {
      const cleanedPC = postalCode.replace(/\s+/g, "");
      if (!/^\d{10}$/.test(cleanedPC)) {
        return res.status(400).json({
          message: "کد پستی باید 10 رقم باشد",
          state: "error"
        });
      }
      user.addresses[addressIndex].postalCode = cleanedPC;
    }
    if (typeof isDefault !== 'undefined') {
      user.addresses[addressIndex].isDefault = isDefault;
    }

    await user.save();

    return res.status(200).json({
      message: "آدرس با موفقیت ویرایش شد",
      address: user.addresses[addressIndex],
      state: "ok"
    });
  } catch (error) {
    console.error("Error updating address:", error);
    return res.status(500).json({
      message: "خطا در ویرایش آدرس",
      error: error.message,
    });
  }
};

// Delete an address
export const deleteUserAddress = async (req, res) => {
  try {
    const { user_id } = getUserFromToken(req, res);
    const { addressId } = req.params;

    const user = await UserAccounts.findOne({ userId: user_id });
    if (!user) {
      return res.status(404).json({ message: "کاربر یافت نشد" });
    }

    const addressIndex = user.addresses.findIndex(
      addr => addr.addressId === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({ 
        message: "آدرس یافت نشد",
        state: "error" 
      });
    }

    const wasDefault = user.addresses[addressIndex].isDefault;
    user.addresses.splice(addressIndex, 1);

    // If deleted address was default, set first remaining address as default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    return res.status(200).json({
      message: "آدرس با موفقیت حذف شد",
      state: "ok"
    });
  } catch (error) {
    console.error("Error deleting address:", error);
    return res.status(500).json({
      message: "خطا در حذف آدرس",
      error: error.message,
    });
  }
};

// Set an address as default
export const setDefaultAddress = async (req, res) => {
  try {
    const { user_id } = getUserFromToken(req, res);
    const { addressId } = req.params;

    const user = await UserAccounts.findOne({ userId: user_id });
    if (!user) {
      return res.status(404).json({ message: "کاربر یافت نشد" });
    }

    const addressIndex = user.addresses.findIndex(
      addr => addr.addressId === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({ 
        message: "آدرس یافت نشد",
        state: "error" 
      });
    }

    // Unset all defaults
    user.addresses.forEach(addr => {
      addr.isDefault = false;
    });

    // Set new default
    user.addresses[addressIndex].isDefault = true;
    await user.save();

    return res.status(200).json({
      message: "آدرس پیش‌فرض تنظیم شد",
      state: "ok"
    });
  } catch (error) {
    console.error("Error setting default address:", error);
    return res.status(500).json({
      message: "خطا در تنظیم آدرس پیش‌فرض",
      error: error.message,
    });
  }
};


  
  export const userStockAlertInfoGet = async (req, res) => {
  try {
    const {user_id} = getUserFromToken(req, res);  // This will handle token extraction and verification
    const product_id = req.params.product_id; // Extract product_id from URL parameters

    // Validate that product_id is provided
    if (!product_id) {
      return res.status(400).json({ 
        message: "Product ID is required", 
        status: "error" 
      });
    }

    const userId = user_id

    // Fetch the stock alert info for the authenticated user and specific product
    let userStockAlert = await UserStockAlert.findOne({ userId, product_id });

    if (!userStockAlert) {
      // If not found, create a default stock alert with valid values
      userStockAlert = new UserStockAlert({
        userId,
        product_id,
        alertType: "not_selected", // Use a valid enum value
        price: "", // Empty string is valid
        inventory: "", // Empty string is valid
        supplierSelection: "select", // Use a valid enum value
        selectedSuppliers: [], // Empty array is valid for "select" case
        sms: false, // Use a boolean value
        email: false, // Use a boolean value
      });

      // Optionally, you can save this default stock alert to the database
      await userStockAlert.save();
    }

    // Send the stock alert info in response
    res.status(200).json({
      message: "User stock alert fetched successfully",
      status: "ok",
      data: userStockAlert,
    });
  } catch (error) {
    console.error("Error fetching user stock alert:", error);
    res.status(500).json({ message: "Failed to fetch user stock alert", error: error.message });
  }
};



export const userStockAlertInfoSet = async (req, res) => {
  try {
    const { alertType, price, inventory, supplierSelection, selectedSuppliers, sms, email, product_id } = req.body;

    const {user_id} = getUserFromToken(req, res);  // This will handle token extraction and verification

    // Validate that product_id is provided
    if (!product_id) {
      return res.status(400).json({ 
        message: "Product ID is required", 
        status: "error" 
      });
    }

    const userId = user_id

    // Normalize selectedSuppliers: Ensure it's stored as an array of numbers
    let normalizedSuppliers = [];
    if (Array.isArray(selectedSuppliers)) {
      normalizedSuppliers = selectedSuppliers.map(id => Number(id));
    } else {
      normalizedSuppliers = [];
    }

    // Validate alertType, if it's required and empty, set a default value
    const validAlertType = alertType || "default"; // Use a default value if alertType is empty

    // Check if the user's stock alert exists for this specific product
    let existingAlert = await UserStockAlert.findOne({ userId, product_id });

    if (!existingAlert) {
      // Create a new stock alert if it doesn't exist
      existingAlert = new UserStockAlert({
        userId,
        product_id,
        alertType: validAlertType,
        price: price || "",
        inventory: inventory || "",
        supplierSelection: supplierSelection || "all",
        selectedSuppliers: normalizedSuppliers,  // Store supplier IDs as numbers
        sms: sms ?? false,
        email: email ?? false,
      });

      await existingAlert.save();
      return res.status(201).json({
        message: "Stock alert created successfully",
        status: "ok",
        data: existingAlert,
      });
    }

    // Update the existing stock alert (except userId and product_id)
    existingAlert.alertType = validAlertType;
    existingAlert.price = price || "";
    existingAlert.inventory = inventory || "";
    existingAlert.supplierSelection = supplierSelection;
    existingAlert.selectedSuppliers = normalizedSuppliers; // Store supplier IDs as numbers
    existingAlert.sms = sms ?? false;
    existingAlert.email = email ?? false;

    await existingAlert.save();

    res.status(200).json({
      message: "Stock alert updated successfully",
      status: "ok",
      data: existingAlert,
    });
  } catch (error) {
    console.error("Error saving stock alert:", error);
    res.status(500).json({ message: "Failed to save stock alert", error: error.message });
  }
};

export const userStockAlertInfoRemove = async (req, res) => {
  try {  
    const {user_id} = getUserFromToken(req, res);  // This will handle token extraction and verification
    const {product_id} = req.params; // Extract product_id from URL parameters

    if (!product_id) {
      return res.status(400).json({ 
        message: "Product ID is required", 
        status: "error" 
      });
    }

    const userId = user_id

    // Find and delete the stock alert for the specific user and product
    const deletedAlert = await UserStockAlert.findOneAndDelete({ userId, product_id });

    if (!deletedAlert) {
      return res.status(404).json({
        message: "Stock alert not found for this product",
        status: "error"
      });
    }

    // Create a default stock alert object to return (not saved to database)
    const userStockAlert = {
      userId,
      product_id,
      alertType: "not_selected", // Use a valid enum value
      price: "", // Empty string is valid
      inventory: "", // Empty string is valid
      supplierSelection: "select", // Use a valid enum value
      selectedSuppliers: [], // Empty array is valid for "select" case
      sms: false, // Use a boolean value
      email: false, // Use a boolean value
    };

    return res.status(200).json({
      message: "Stock alert removed successfully",
      status: "ok",
      userStockAlert
    });

  } catch (error) {
    console.error("Error removing stock alert:", error);
    res.status(500).json({ message: "Failed to remove stock alert", error: error.message });
  }
};

  
export const getUserFavoritesList = async (req, res) => {
  try {
    const { user_id } = getUserFromToken(req, res);

    if (!user_id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await UserMyAccount.findOne({ userId: user_id });


    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    

    // Return the user's favorites array
    return res.status(200).json({
      success: true,
      favorites: user.favorites || [],
      message: "User favorites retrieved successfully"
    });

  } catch (error) {
    console.error("Error getting user favorites:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};
  
  export const addedToFavorites = async (req, res) => {
    try {
      const { user_id } = getUserFromToken(req, res);
      const productId = req.params.productId;

  
      if (!productId) {
        return res.status(400).json({ success: false, message: "Product ID is required" });
      }
    
  
      const user = await UserMyAccount.findOne({userId: user_id})
  
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      const isFavorite = user.favorites.some(fav => fav.id === productId);

      return res.status(200).json({
        success: true,
        isFavorite: isFavorite,
      });
  
    } catch (error) {
      console.error("Error checking favorites:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message
      });
    }
  };
  

  export const addToFavorites = async (req, res) => {
    try {
      const { user_id } = getUserFromToken(req, res);
      const productId = req.params.productId;


      if (!productId) {
        return res.status(400).json({ success: false, message: "Product ID is required" });
      }
  
      // Find the user by user_id
      const user = await UserMyAccount.findOne({ userId: user_id });
  
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      // Check if the product is already in the user's favorites
      const isFavorite = user.favorites.some(favorite => favorite.id === productId);
      if (isFavorite) {
        return res.status(400).json({ success: false, message: "Product already in favorites" });
      }
  
      // Add the product to the favorites array
      user.favorites.push({ id: productId });
  
      // Save the updated user document
      await user.save();



    // res.status(201).json({
    //   message: "خطایی رخ داده است",
    //   state: "error",
    //   errors: {
    //     name: "فقط کاراکترهای فارسی مجاز هستند",
    //     surName: "از کاراکترهای فارسی استفاده شود",
    //     nationalCode: "شماره ملی نامعتبر است",
    //     mobile: "شماره موبایل نامعتبر است",
    //     email: "فرمت ایمیل صحیح نیست",
    //     birthday: "تاریخ تولد را به شمسی وارد کنید",
    //     province: "استان را انتخاب کنید",
    //     city: "شهر را انتخاب کنید",
    //     address: "آدرس را وارد کنید",
    //     postalCode: "کد پستی را وارد کنید",
    //     socialNetworkMobile: "شماره موبایل را وارد کنید",
    //     socialNetworkName: "نام شبکه اجتماعی را وارد کنید",
    //   },

    // });


    // return res.status(500).send()


    return res.status(200).json({ 
      success: true, 
      message: "با موفقیت به فهرست علاقه مندی ها اضافه شد.",
      state: "ok",
      // errors: {
      //   addToFavorites: "خطایی رخ داده است"
      // }
    });


    } catch (error) {
      console.error("Error adding to favorites:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message
      });
    }
  };
  

  export const removeFromFavorites = async (req, res) => {
    try {
      const { user_id } = getUserFromToken(req, res);
      const productId = req.params.productId;
  
      if (!productId) {
        return res.status(400).json({ success: false, message: "Product ID is required" });
      }
  
      // Find the user by user_id
      const user = await UserMyAccount.findOne({ userId: user_id });
  
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      // Check if the product is in the user's favorites
      const favoriteIndex = user.favorites.findIndex(favorite => favorite.id === productId);
      if (favoriteIndex === -1) {
        return res.status(400).json({ success: false, message: "Product not in favorites" });
      }
  
      // Remove the product from the favorites array
      user.favorites.splice(favoriteIndex, 1);
  
      // Save the updated user document
      await user.save();




          // return res.status(500).send()


  
          return res.status(200).json({ 
            success: true, 
            message: "با موفقیت از فهرست علاقه مندی ها حذف شد.",
            state: "ok",
            // errors: {
            //   removeFromFavorites: "خطایی رخ داده است"
            // }
          });
    

      // return res.status(201).json({ 
      //   success: true, 
      //   message: "با موفقیت از لیست علاقه مندی ها حذف شد.",
      //   state: "error",
      //   errors: {
      //     removeFromFavorites: "خطایی رخ داده است"
      //   }
      // });



      // return res.status(200).json({ 
      //   success: true, 
      //   message: "Product removed from favorites" 
      // });
 
 
 
    } catch (error) {
      console.error("Error removing from favorites:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message
      });
    }
  };
  