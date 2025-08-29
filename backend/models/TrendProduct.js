import mongoose from "mongoose";

const TrendProductSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
    unique: true, // Ensures each product has a unique URL identifier
  },
  title: {
    type: String,
    required: true,
  },
});

// Define a schema for the trending product groups
const TrendProductGroupSchema = new mongoose.Schema({
  products: {
    type: [[TrendProductSchema]], // Array of arrays containing trending products
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create and export the model
const TrendProductGroup = mongoose.model("TrendProductGroup", TrendProductGroupSchema);

export default TrendProductGroup;
