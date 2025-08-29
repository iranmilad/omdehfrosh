import mongoose from "mongoose";

const fpSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      trim: true
    },
    regularPrice: {
      type: Number,
      required: true
    },
    discountedPrice: {
      type: Number
    },
    discountPercent: {
      type: String
    },
    image: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("FP", fpSchema);
