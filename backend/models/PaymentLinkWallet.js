import mongoose from "mongoose";

const paymentLinkWalletSchema = new mongoose.Schema(
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
    link_url: {
      type: String,
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
    body: {
      type: String,
      required: true,
    },
    referral_link: {
      type: String,
      default: null,
    },
    payment_status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const PaymentLinkWallet = mongoose.model("PaymentLinkWallet", paymentLinkWalletSchema);

export default PaymentLinkWallet;
