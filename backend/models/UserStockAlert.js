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
    },
    selectedSuppliers: {
      type: [Number],
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

// Ensure uniqueness per user-product
userStockAlertSchema.index({ userId: 1, product_id: 1 }, { unique: true });

const UserStockAlert = mongoose.model("UserStockAlert", userStockAlertSchema);

export default UserStockAlert;
