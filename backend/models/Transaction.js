import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true, // ensure no duplicates
      index: true,
    },
    userId: {
      type: Number,
      ref: "User", // reference to User collection
      required: true,
    },
    gatewayName: {
      type: String,
      required: false,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: ["deposit", "withdraw"], // customize for your case
      required: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed", "canceled"],
      default: "pending",
      required: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

export default mongoose.model("Transaction", transactionSchema);
