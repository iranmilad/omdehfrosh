import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema({
  id: String
});

const paymentHistorySchema = new mongoose.Schema({
  transactionId: String,
  date: String,
  amount: Number,
  type: { type: String, enum: ["deposit", "withdrawal", "purchase"] },
  typeDescriptionFa: String,
  methodDescriptionFa: String,
  method: String,
  description: String
});

const transferSchema = new mongoose.Schema({
  transferId: String,
  senderId: Number,
  receiverId: Number,
  amount: Number,
  date: String,
  status: { type: String, enum: ["pending", "completed", "failed"] },
  statusDescriptionFa: String,
  note: String
});

const pendingWithdrawalSchema = new mongoose.Schema({
  requestId: String,
  date: String,
  amount: Number,
  status: { type: String, enum: ["pending", "approved", "rejected"] },
  statusDescriptionFa: String,
  note: String
});

const lastTransactionSchema = new mongoose.Schema({
  transactionId: String,
  date: String,
  amount: Number,
  type: { type: String, enum: ["deposit", "withdrawal", "purchase"] },
  typeDescriptionFa: String
});

const walletSchema = new mongoose.Schema({
  balance: { type: Number, default: 0 },
  blockedAmount: { type: Number, default: 0 },
  paymentHistory: [paymentHistorySchema],
  transfers: [transferSchema],
  pendingWithdrawals: [pendingWithdrawalSchema],
  lastTransaction: lastTransactionSchema
});

const userMyAccountSchema = new mongoose.Schema({
  userId: { type: Number, required: true, unique: true },
  phoneNumber: { type: String, required: true, unique: true },
  account_balance: { type: Number, default: 0 },
  all_orders: { type: Number, default: 0 },
  tickets: { type: Number, default: 0 },
  favorites: [favoriteSchema],
  name: { type: String, required: true },
  userType: { type: String, required: true },
  wallet: walletSchema
});

const UserMyAccount = mongoose.model("UserMyAccount", userMyAccountSchema);

export default UserMyAccount;
