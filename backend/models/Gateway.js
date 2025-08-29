import mongoose from "mongoose";

const gatewaySchema = new mongoose.Schema(
  {
    info: { type: Object, required: true }, // Ensures the name is unique
    label: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true }, // URL to the icon image
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

const Gateway = mongoose.model("Gateway", gatewaySchema);

export default Gateway;
