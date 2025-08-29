import mongoose from "mongoose";

const SubCategorySchema = new mongoose.Schema({
    id: String,
    name: String,
    label: String,
    idSubCategory: String,
    image: String,
});

const CategorySchema = new mongoose.Schema({
    id: String,
    title: String,
    idCategory: String,
    subCategories: [SubCategorySchema], // Nested array of subcategories
    image: String,
});

const FastOrderBrandSchema = new mongoose.Schema({
    id: String,
    title: String,
    idBrand: String,
    name: String,
    categories: [CategorySchema], // Nested array of categories
    image: String,
});

// Create a Mongoose model for brands
const FastOrderBrand = mongoose.model("FastOrderBrand", FastOrderBrandSchema);

export default FastOrderBrand;
