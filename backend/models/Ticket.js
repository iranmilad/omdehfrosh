import mongoose from "mongoose";

const { Schema, model } = mongoose;

// Message schema (used inside each ticket)
const TicketMessageSchema = new Schema({
  sender: {
    role: { type: String, enum: ["user", "support"], required: true },
    userId: { type: Number, required: true },
    name: { type: String, required: true },
  },
  message: { type: String, required: true },
  file: { type: String, default: "" },
}, { _id: false });

// Ticket schema (used inside each user document)
const TicketSchema = new Schema({
  ticketId: { type: String, required: true, unique: true },
  ticketTitle: { type: String, required: true },
  team: { type: String, required: true },
  teamName: { type: String, required: true },
  ticketDescription: { type: String, required: true },
  messages: [TicketMessageSchema],
  ticketStatus: { type: String, enum: ["open", "closed", "pending"], default: "open" },
  requesterId: { type: Number, required: true },
  requesterName: { type: String, required: true },
  ticketId: { type: String, required: true },
  priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  createdAt: { type: String },
  updatedAt: { type: String },
}, { _id: false });

// Main schema (one document per user)
const TicketsSchema = new Schema({
  userId: { type: Number, required: true, unique: true },
  tickets: [TicketSchema],
}, { timestamps: true });

export default model("Tickets", TicketsSchema);
