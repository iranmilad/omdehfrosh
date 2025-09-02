// import mongoose from "mongoose";

// const paymentLinkSchema = new mongoose.Schema({
//   link_id: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   gateway_id: {
//     type: Number,
//     required: true
//    },
//   // authority_id: {
//   //   type: String,
//   //   required: true
//   // },
//   link_url: {
//     type: String,
//     required: true,
//   },
//   payment_amount: {
//     type: Number,
//     required: true,
//   },
//   payment_currency: {
//     type: String,
//     required: true,
//   },
//   user_id: {
//     type: String,
//     required: true,
//   },
//   receipt_id: {
//     type: String,
//     required: true,
//   },
//   body: {
//     type: String,
//     required: true
//   },
//   reference_cart_id: { type: String, required: true, unique: true },
//   referral_link: {
//     type: String,
//     default: null, 
//   },
//   payment_status: {
//     type: String,
//     default: 'pending', // or 'paid', 'failed'
//   }
// }, { timestamps: true });

// const PaymentLink = mongoose.model("PaymentLink", paymentLinkSchema);
// export default PaymentLink;


import mongoose from "mongoose";

const paymentLinkSchema = new mongoose.Schema({
  link_id: {
    type: String,
    required: true,
    unique: true,
  },
  link_url: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true
  },
}, { timestamps: true });

const PaymentLink = mongoose.model("PaymentLink", paymentLinkSchema);
export default PaymentLink;




