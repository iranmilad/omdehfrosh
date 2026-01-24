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
    isPaid: {
      type: String,
      required: true,
      default: "unpaid"
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
      type: String,
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
      type: String,
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
    // NEW: Payment type field
    payment_type: {
      type: String,
      enum: ["gateway", "wallet", "cod", "cash", "credit"],
      default: "gateway",
    },
    // NEW: Wallet transaction ID (only populated for wallet payments)
    payment_wallet_transactionid: {
      type: String,
      default: null,
    },
    address: {
      type: Object,
      default: null,
      address_id: {
        type: String,
        default: null,
      },
      full_address: {
        type: String,
        default: null,
      },
      city: {
        type: String,
        default: null,
      },
      state: {
        type: String,
        default: null,
      },
      postal_code: {
        type: String,
        default: null,
      },
      recipient_name: {
        type: String,
        default: null,
      },
      recipient_phone: {
        type: String,
        default: null,
      },
    },
  },
  { timestamps: true }
);

orderSchema.set("versionKey", false);

export default mongoose.model("OrderJ2B", orderSchema);