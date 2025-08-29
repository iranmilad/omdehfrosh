import mongoose from "mongoose";

const paymentWalletSchema = new mongoose.Schema(
  {
    link_id: {
      type: String,
      required: true,
      unique: true,
    },
    gateway_id: {
      type: Number,
      required: true,
    },
    payment_amount: {
      type: Number,
      required: true,
    },
    payment_currency: {
      type: String,
      required: true,
    },
    user_id: {
      type: Number,
      required: true,
    },
    payment_status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    order_id: {
      type: String,
      default: "",
    },
    paymentComment: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

const PaymentWallet = mongoose.model("PaymentWallet", paymentWalletSchema);

export default PaymentWallet;
