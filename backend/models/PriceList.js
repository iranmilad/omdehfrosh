import mongoose from 'mongoose';

const TableItemSchema = new mongoose.Schema({
  product: { type: String, required: true },
  price: { type: String, required: true } // Use String only if price is not used in calculations. Prefer Number otherwise.
});

const PriceListSchema = new mongoose.Schema({
  title: { type: String, required: true },
  id: { type: String, required: true },
  tablelist: { type: [TableItemSchema], default: [] }
});

// Model
const PriceList = mongoose.model('PriceList', PriceListSchema);

export default PriceList;
