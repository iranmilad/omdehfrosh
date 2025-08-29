import mongoose from "mongoose";

const fastOrderLocationSchema = new mongoose.Schema({
  idSupplier: { type: String, required: true },
  nameSupplier: { type: String, required: true },
  label: { type: String, required: true },
  locations: { type: [Object], required: true },
});

const FastOrderLocation = mongoose.model("FastOrderLocation", fastOrderLocationSchema);

export default FastOrderLocation;
