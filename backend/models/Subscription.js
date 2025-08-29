import mongoose from "mongoose";

const priceSchema = new mongoose.Schema({
  regularPrice: { type: Number, required: true },
  discountedPrice: { type: Number, required: true },
  discountNum: { type: Number, required: true },
  discountPer: { type: Number, required: true },
}, { _id: false });

const accessSchema = new mongoose.Schema({
  productManagement: { type: Boolean, required: true },
  inventoryManagement: { type: Boolean, required: true },
  bulkPricing: { type: Boolean, required: true },
  analytics: { type: Boolean, required: true },
  prioritySupport: { type: Boolean, required: true },
  dashboardAccess: { type: Boolean, required: true },
  advancedSearchFilters: { type: Boolean, required: true },
  orderManagement: { type: Boolean, required: true },
  categories: {
    type: Map,
    of: Boolean,
    required: true,
  }
}, { _id: false });

const subscriptionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  modelId: { type: String, required: true, unique: true },
  subscription: { type: String, enum: ['free', 'pro', 'premium'], required: true },
  duration: { type: String, required: true },
  combinationsID: {type: Number, required: true},
  durationDays: { type: Number, required: true },
  price: { type: priceSchema, required: true },
  sellerId: { type: Number, required: true },
  sellerLabel: { type: String, required: true },
  description: { type: String, required: true },
  features: [{ type: String, required: true }],
  access: { type: accessSchema, required: true },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});



const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
