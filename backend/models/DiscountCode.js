import mongoose from "mongoose";

const discountCodeSchema = new mongoose.Schema({
  code: { type: String, default: "" }, // Discount code string
  numberDiscount: { type: Number, default: 0 }, // Fixed discount amount
  percentDiscount: { type: Number, default: 0 }, // Percentage-based discount
});

const DiscountCode = mongoose.model("DiscountCode", discountCodeSchema);
export default DiscountCode;
