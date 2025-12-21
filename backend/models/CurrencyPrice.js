import mongoose from "mongoose";

const currencyPriceSchema = new mongoose.Schema({
  user_id: { 
    type: Number, 
    required: true,
    index: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  currency: {
    type: String,
    default: "USD",
    enum: ["USD", "EUR", "CNY", "TRY"] // Add currencies as needed
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update timestamp on save
currencyPriceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const CurrencyPrice = mongoose.model("CurrencyPrice", currencyPriceSchema);
export default CurrencyPrice;