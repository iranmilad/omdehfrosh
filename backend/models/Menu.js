import mongoose from "mongoose";

// Define MenuLinkSchema
const MenuLinkSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    label: { type: String, required: true },
    icon: { type: String, default: null },
    mega: { type: Boolean, default: false },
    url: { type: String, default: null },
    links: [{ type: mongoose.Schema.Types.Mixed }] // Fix: Allow nested links dynamically
});

// Define MenuCategorySchema
const MenuCategorySchema = new mongoose.Schema({
    id: { type: Number, required: true },
    label: { type: String, required: true },
    icon: { type: String, default: null },
    mega: { type: Boolean, default: false },
    url: { type: String, default: null },
    links: [MenuLinkSchema] // Fix: Use MenuLinkSchema here
});

// Define Main Menu Schema
const MenuSchema = new mongoose.Schema({
    main: [MenuCategorySchema],
    footer: [MenuCategorySchema],
    social: [MenuCategorySchema]
});

// Create Model
const Menu = mongoose.model("Menu", MenuSchema);

export default Menu;
