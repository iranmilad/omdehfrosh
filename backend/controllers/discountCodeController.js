import DiscountCode from "../models/DiscountCode.js"; // Import DiscountCode model

// Add a new discount code
export const addCode = async (req, res) => {
  try {
    const { code, numberDiscount, percentDiscount } = req.body;

    // Validate input
    if (!code) {
      return res.status(400).json({ message: "Discount code is required" });
    }

    // Check if code already exists
    const existingCode = await DiscountCode.findOne({ code });
    if (existingCode) {
      return res.status(400).json({ message: "Discount code already exists" });
    }

    // Create new discount code
    const newDiscountCode = new DiscountCode({
      code,
      numberDiscount: numberDiscount || 0,
      percentDiscount: percentDiscount || 0,
    });

    await newDiscountCode.save();
    res.status(201).json({ message: "Discount code added successfully", newDiscountCode });

  } catch (error) {
    console.error("Error adding discount code:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get discount code details
export const getDiscountCode = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ message: "Discount code is required" });
    }

    const discountCode = await DiscountCode.findOne({ code });

    if (!discountCode) {
      return res.status(404).json({ message: "Discount code not found" });
    }

    res.status(200).json(discountCode);
  } catch (error) {
    console.error("Error fetching discount code:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Remove a discount code
export const removeDiscountCode = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Discount code is required" });
    }

    const deletedCode = await DiscountCode.findOneAndDelete({ code });

    if (!deletedCode) {
      return res.status(404).json({ message: "Discount code not found" });
    }

    res.status(200).json({ message: "Discount code removed successfully" });
  } catch (error) {
    console.error("Error removing discount code:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
