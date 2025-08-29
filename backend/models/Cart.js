import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  user_id: { type: Number, required: true },
  cart_id: { type: String, required: true, unique: true }, 
  isActive: { type: Boolean, default: true, required: true },
  cartItems: [
    {
      productId: String,
      combinationsID: Number,
      seller_id: Number,
      name: String,
      image: String,
      count: Number,
      max: Number,
      min: Number,
      attributes: [{ color: String, material: String }],
      price: {
        regularPrice: Number,
        discountPercent: Number,
        discountedPrice: Number,
      },
      seller: { id: Number, label: String },
    },
  ],
});

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
