import mongoose from "mongoose";

const userStockAlertSchema = new mongoose.Schema(
  {
    userId: {
      type: Number,
      required: true,
    },
    product_id: {
      type: String,
      required: true,
    },
    alertType: {
      type: String,
      required: true,
      enum: ["stock_available", "price_reach", "inventory", "best_price", "not_selected"], // Example options
    },
    price: {
      type: String, // Change to Number if needed
      default: "",
    },
    inventory: {
      type: String, // Change to Number if needed
      default: "",
    },
    supplierSelection: {
      type: String,
      required: true,
      enum: ["select", "all"], // Example options
    },
    selectedSuppliers: {
      type: [Number], // ✅ Change from ObjectId to Number
      validate: {
        validator: function (value) {
          return value === "all" || (Array.isArray(value) && value.every(v => typeof v === "number"));
        },
        message: "selectedSuppliers must be 'all' or an array of numbers.",
      },
    },
    sms: {
      type: Boolean,
      default: false,
    },
    email: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Create compound index for efficient queries and ensure uniqueness per user-product combination
userStockAlertSchema.index({ userId: 1, product_id: 1 }, { unique: true });

const UserStockAlert = mongoose.model("UserStockAlert", userStockAlertSchema);

export default UserStockAlert;