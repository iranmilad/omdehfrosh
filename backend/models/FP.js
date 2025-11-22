import mongoose from "mongoose";

const fpSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true
    },
    combinationId: {
      type: Number,
      required: true
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
    attributes: [
      {
        name: {
          type: String,
          required: true
        },
        value: {
          type: String,
          required: true
        }
      }
    ],
    seller: {
      id: {
        type: Number,
        required: true
      },
      label: {
        type: String,
        required: true
      }
    },
    image: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("FP", fpSchema);