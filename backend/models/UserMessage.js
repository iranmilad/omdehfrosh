import mongoose from 'mongoose';

const discountMessageSchema = new mongoose.Schema({
  messageDiscountCodeId: Number,
  messageDiscountCodeTitle: String,
  messageDiscountCodeBody: String,
  isRead: { type: Boolean, default: false },
  icon: String,
  link: String,
}, { _id: false });

const productAddedMessageSchema = new mongoose.Schema({
  messageNotifProductAddedId: Number,
  messageNotifProductAddedTitle: String,
  messageNotifProductAddedDesc: String,
  isRead: { type: Boolean, default: false },
  icon: String,
  img: String,
  productId: String,
}, { _id: false });

const notificationMessageSchema = new mongoose.Schema({
  notificationType: {
    type: String,
    required: true,
  },
  notificationTitle: String,
  notificationId: String,
  notificationData: {
    type: [mongoose.Schema.Types.Mixed], // Accepts either discount or productAdded schema
    default: [],
  },
}, { _id: false });

const userMessagesSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  messages: [notificationMessageSchema],
}, { timestamps: true });

export default mongoose.model('UserMessage', userMessagesSchema);
