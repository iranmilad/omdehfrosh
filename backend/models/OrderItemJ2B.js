import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      required: true,
    },
    isPaid: {
      type: String,
      required: true,
      default: "unpaid"
    },
    vatRequested: {
      type: Boolean,
      required: true,
      default: false
    },
    priceWithVat: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: {name: String, paymentMethod: String},
    },
    // NEW: Payment type for this item
    payment_type: {
      type: String,
      enum: ["gateway", "wallet", "cod", "cash", "credit"],
      default: "gateway",
    },
    // NEW: Wallet transaction ID for this item
    payment_wallet_transactionid: {
      type: String,
      default: null,
    },
    vatLink: {
      type: String,
      default: ""
    },
    order_id: {
      type: String,
      required: true,
    },
    product_id: {
      type: [{id: String, combinationId: String}],
      required: true,
    },
    supplier_id: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      default: null,
    },
    discount_price: {
      type: Number,
      default: null,
    },
    totalPrice: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ["waiting", "processing", "complete", "cancel", "stop", "referral"],
      default: "waiting",
    },
  },
  { timestamps: true }
);

orderItemSchema.set("versionKey", false);

export default mongoose.model("OrderItemJ2B", orderItemSchema);