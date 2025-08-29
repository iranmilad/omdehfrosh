import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      required: true,
    },
    customer_name: {
      type: String,
      required: true,
    },
    customer_email: {
      type: String,
      default: null,
    },
    supplier_id: {
      type: Number,
      default: null,
    },
    customer_phone_number: {
      type: String,
      default: null,
    },
    user_id: {
      type: String, // stored as string instead of ObjectId
      default: null,
    },
    total_price: {
      type: Number,
      default: 0,
    },
    total_discount: {
      type: Number,
      default: 0,
    },
    discount_code_id: {
      type: String, // stored as string instead of ObjectId
      default: null,
    },
    status: {
      type: String,
      enum: ["basket", "pending", "processing", "complete", "cancel", "reject"],
      default: "basket",
    },
    delivery_type: {
      type: String,
      enum: [
        "home_delivery",
        "store_delivery",
        "normal",
        "express",
        "bike",
      ],
      default: "store_delivery",
    },
    payment_method: {
      type: String,
      enum: ["cash", "credit", "check"],
      default: "cash",
    },
  },
  { timestamps: true }
);

// optional: disable version key (__v)
orderSchema.set("versionKey", false);

export default mongoose.model("OrderJ2B", orderSchema);
