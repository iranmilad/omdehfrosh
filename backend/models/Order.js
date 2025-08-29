import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
order_id: {
    type: String,
    required: true,
    unique: true,
},
  totalPriceToPay: { type: Number, required: true },
  receipt_id: { type: String, required: true, unique: true },
  reference_cart_id: { type: String, required: true, unique: true },
  user_id: { type: Number, required: true, required: true },
  isPaid: {type: String, default: ""},
  paymentComment: { type: String, default: ""},
  address: {type: String, required: true},
  name: {type: String, required: true},
  mobile: {type: String, required: true},
  delivered: {type: Boolean, required: true, default: false},
  sellers: [
    {
      vatRequested: { type: Boolean, default: false },
      vatLink: { type: String, default: "" },
      isPaid: {type: String, default: "prepaid"},
      paymentComment: { type: String, default: ""},
      receipt_id_seller: { type: String, required: true },
      seller: { id: Number, label: String },
      priceApplyEachSeller: Number,
      items: [
        {
          itemPriceApply: Number,
          item: {
            productId: String,
            combinationsID: Number,
            seller_id: Number,
            name: String,
            priceWithVat: {
              regularPriceWithVat: Number,
              discountPercent: Number,
              discountedPriceWithVat: Number,
            },
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
        },
      ],
    },
  ],
  totalPriceApply: Number,
  cartDiscounts: {
    discountCode: {
        code: {
          type: String,
          default: "", 
        },
        numberDiscount: {
          type: Number,
          default: 0, 
        },
        percentDiscount: {
          type: Number,
          default: 0, 
        },
      },
  },
  paymentMethod: { type: Object, default: {} }, // New field added
}, { timestamps: true });

const Order = mongoose.model("Order", OrderSchema);
export default Order;
