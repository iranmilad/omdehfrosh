import mongoose from "mongoose";

const HomePageProductSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true }, // Unique product ID
  title: { type: String, required: true }, // Product title
  slug: { type: String, required: true, unique: true }, // Slug for SEO-friendly URLs
  regularPrice: { type: Number, required: true }, // Regular price
  discountedPrice: { type: Number, default: null }, // Optional discounted price
  discountPercent: { type: String, default: null }, // Discount percentage
  image: { type: String, required: true }, // Product image URL
});

const HomePageProduct = mongoose.model("HomePageProduct", HomePageProductSchema);

export default HomePageProduct;
