// models/Bootstrap.js
import mongoose from "mongoose";

const { Schema } = mongoose;

// Recursive schema for menu items
const MenuItemSchema = new Schema({
  id: { type: String, required: true },
  label: { type: String, required: true },
  icon: { type: String, default: null },
  mega: { type: Boolean, default: false },
  url: { type: String, default: null },
  links: [{ type: Object }], // will hold recursive menu links
}, { _id: false });

// Banner schema
const BannerSchema = new Schema({
  link: { type: String, required: true },
  src: { type: String, default: "" }
}, { _id: false });

// Main bootstrap schema
const BootstrapSchema = new Schema({
  siteTitle: { type: String, required: true },
  logo: { type: String, required: true },  // store logo URL/path
  banner: { type: BannerSchema, required: true },
  menu: {
    main: [MenuItemSchema],
    footer: [MenuItemSchema],
    social: [MenuItemSchema],
  },
  footerAbout: { type: String, default: "" },
}, {
  timestamps: true, // createdAt, updatedAt
});

const Bootstrap = mongoose.model("Bootstrap", BootstrapSchema);

export default Bootstrap;
