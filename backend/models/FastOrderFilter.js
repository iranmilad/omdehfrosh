import mongoose from 'mongoose';

const SellerSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: String, required: true }
});

const ColorSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: String, required: true }
});

const deliveryTimeSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: String, required: true }
});

const FastOrderFilterSchema = new mongoose.Schema({
  sellers: [SellerSchema], // Array of sellers
  colors: [ColorSchema],    // Array of colors
  deliveryTime: [deliveryTimeSchema]
});

// Create the Mongoose model for filters
const FastOrderFilter = mongoose.model('FastOrderFilter', FastOrderFilterSchema);

export default FastOrderFilter;
