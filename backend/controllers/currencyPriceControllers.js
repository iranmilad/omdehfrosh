import CurrencyPrice from "../models/CurrencyPrice.js";
import getUserFromToken from "../libs/verifyToken.js";

/**
 * Update or create currency price for user
 * @route POST /api/currency-price/update
 */
export const updateCurrencyPrice = async (req, res) => {
  try {
    const tokenData = getUserFromToken(req, res);
    if (!tokenData || !tokenData.user_id) {
      return res.status(401).json({ message: "Unauthorized: user not found" });
    }
    const user_id = tokenData.user_id;
    const { price, currency = "USD" } = req.body;

    console.log(JSON.stringify(req.body));

    // Validate price
    if (!price || isNaN(price) || price <= 0) {
      return res.status(400).json({
        status: "ERROR",
        message: "قیمت ارز معتبر نیست" // Invalid currency price
      });
    }

    // Find existing currency price for user or create new one
    let currencyPrice = await CurrencyPrice.findOne({ 
      user_id: user_id,
      isActive: true 
    });

    if (currencyPrice) {
      // Update existing
      currencyPrice.price = price;
      currencyPrice.currency = currency;
      currencyPrice.updatedAt = new Date();
      await currencyPrice.save();
    } else {
      // Create new
      currencyPrice = new CurrencyPrice({
        user_id: user_id,
        price: price,
        currency: currency
      });
      await currencyPrice.save();
    }

    return res.status(200).json({
      status: "OK",
      message: "قیمت ارز با موفقیت ثبت شد", // Currency price saved successfully
      data: {
        price: currencyPrice.price,
        currency: currencyPrice.currency,
        updatedAt: currencyPrice.updatedAt
      }
    });

  } catch (error) {
    console.error("Error updating currency price:", error);
    return res.status(500).json({
      status: "ERROR",
      message: "خطای سرور", // Server error
      error: error.message
    });
  }
};


/**
 * Get current currency price for user
 * @route GET /api/currency-price/get
 */
export const getCurrencyPrice = async (req, res) => {
  try {
    const tokenData = getUserFromToken(req, res);
    if (!tokenData || !tokenData.user_id) {
      return res.status(401).json({ message: "Unauthorized: user not found" });
    }
    const user_id = tokenData.user_id;
    const currencyPrice = await CurrencyPrice.findOne({ 
      user_id: user_id,
      isActive: true 
    }).sort({ updatedAt: -1 }); // Get the most recent one

    // If no currency price found, return default values instead of error
    if (!currencyPrice) {
      return res.status(200).json({
        status: "OK",
        message: "قیمت ارز یافت نشد، مقادیر پیش‌فرض برگردانده شد",
        data: {
          price: null,
          currency: "USD",
          updatedAt: null,
          isDefault: true
        }
      });
    }

    return res.status(200).json({
      status: "OK",
      message: "قیمت ارز با موفقیت دریافت شد",
      data: {
        price: currencyPrice.price,
        currency: currencyPrice.currency,
        updatedAt: currencyPrice.updatedAt,
        isDefault: false
      }
    });

  } catch (error) {
    console.error("Error getting currency price:", error);
    return res.status(500).json({
      status: "ERROR",
      message: "خطای سرور",
      error: error.message
    });
  }
};

/**
 * Delete currency price for user
 * @route DELETE /api/currency-price/delete
 */
export const deleteCurrencyPrice = async (req, res) => {
  try {
    const tokenData = getUserFromToken(req, res);
    if (!tokenData || !tokenData.user_id) {
      return res.status(401).json({ message: "Unauthorized: user not found" });
    }
    const user_id = tokenData.user_id;
    const result = await CurrencyPrice.findOneAndUpdate(
      { user_id: user_id, isActive: true },
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({
        status: "ERROR",
        message: "قیمت ارز یافت نشد"
      });
    }

    return res.status(200).json({
      status: "OK",
      message: "قیمت ارز حذف شد"
    });

  } catch (error) {
    console.error("Error deleting currency price:", error);
    return res.status(500).json({
      status: "ERROR",
      message: "خطای سرور",
      error: error.message
    });
  }
};