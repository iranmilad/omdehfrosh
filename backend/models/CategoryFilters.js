// models/CategoryFilter.js
import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: String, required: true }
}, { _id: false });

const filterSchema = new mongoose.Schema({
  title: { type: String, required: true },
  key: { type: String, required: true },
  options: [optionSchema]
}, { _id: false });

const categoryFilterSchema = new mongoose.Schema({
  filters: [filterSchema],
  price: {
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },
  totalPages: { type: Number, required: true }
});

const CategoryFilter = mongoose.model("CategoryFilter", categoryFilterSchema);
export default CategoryFilter;

