import mongoose from "mongoose";

const SMSSchema = new mongoose.Schema({
  id: { type: Number, unique: true, required: true }, // Unique auto-increment ID
  // userId: { type: Number, required: true }, // Reference to user
  mobile: { 
    type: String, 
    required: true, 
    match: /^[0-9]{10,15}$/, // Ensures a valid phone number (10-15 digits)
  },
  smsCode: { 
    type: String, 
    required: true, 
    match: /^[0-9]{4}$/, // Ensures exactly 4-digit numeric code
  },
  createdAt: { type: Date, default: Date.now, expires: 300 } // Auto-delete after 5 minutes
});

// Auto-increment `id` based on count
SMSSchema.pre("save", async function (next) {
  if (!this.id) {
    const count = await mongoose.model("SMS").countDocuments();
    this.id = count + 1;
  }
  next();
});

const SMS = mongoose.model("SMS", SMSSchema);
export default SMS;
