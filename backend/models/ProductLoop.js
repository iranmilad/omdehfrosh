import mongoose from "mongoose";

const ProductLoopItemSchema = new mongoose.Schema({
  image: { type: String, required: true },
  url: { type: String, required: true },
  title: { type: String, required: true },
  regularPrice: { type: Number },
  discountedPrice: { type: Number },
  discountPercent: { type: String },
});

const ProductLoopGroupSchema = new mongoose.Schema({
  title: {
    type: String,
    default: "محصولات منتخب",
  },
  products: {
    type: [[ProductLoopItemSchema]],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ProductLoopGroup = mongoose.model("ProductLoopGroup", ProductLoopGroupSchema);
export default ProductLoopGroup;
