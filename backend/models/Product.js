import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
    commentId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    date: { type: String, required: true },
    rating: { type: Number, required: true },
    status: { type: String, enum: ["agreed", "pending", "rejected"], required: true },
    commentText: { type: String, required: true }
});

const SupplierSchema = new mongoose.Schema({
    supplierId: { type: Number, required: true },
    supplierName: { type: String, required: true },
    comments: [CommentSchema]
});

const CombinationSchema = new mongoose.Schema({
    combinationId: { type: Number, required: true },
    suppliers: [SupplierSchema]
});

const ProductSchema = new mongoose.Schema({
    productId: { type: String, required: true, unique: true },
    productCombinations: [CombinationSchema]
});

const Product = mongoose.model("Product", ProductSchema);

export default Product;
