import mongoose from "mongoose";


const purchasedProductSchema = new mongoose.Schema({
  product_id: { type: String, required: true }, // Unique product identifier
  sellerId: { type: Number, required: true }, // Seller ID
  sellerName: { type: String, required: true }, //  
  combinationsID: { type: Number, required: true }, // Product combination ID
  title: { type: String, required: true }, // Product title
  regularPrice: { type: Number, required: true }, // Original price
  discountedPrice: { type: Number, required: true }, // Price after discount
  discountPercent: { type: Number, required: true }, // Discount percentage
  image: { type: String, required: true }, // Image URL
}, { _id: false }); // Disable auto _id for embedded array items

const userSchema = new mongoose.Schema({
  userId: { type: Number, unique: true, required: true }, // User ID (can also use ObjectId)
  purchasedProducts: [purchasedProductSchema] // Array of purchased products
}, { timestamps: true }); // Auto timestamps (createdAt, updatedAt)

const UserPurchasedProducts = mongoose.model("UserPurchasedProducts", userSchema);

export default UserPurchasedProducts;
