import mongoose from "mongoose";

const ProductItemSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
});

const ProductCategorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
    // unique: true, // Ensures each category has a unique URL
  },
  children: {
    type: [ProductItemSchema], // Array of product items
    required: true,
  },
});

const ProductGrid = mongoose.model("ProductGrid", ProductCategorySchema);

export default ProductGrid;
