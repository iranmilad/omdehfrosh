import mongoose from "mongoose";

const BrandSchema = new mongoose.Schema({
    idBrand: { type: String, required: true },
    name: { type: String, required: true },
    label: { type: String, required: true },
    image: { type: String, required: true }
});

const SubCategorySchema = new mongoose.Schema({
    idSubCategory: { type: String, required: true },
    name: { type: String, required: true },
    label: { type: String, required: true },
    image: { type: String, required: true },
    brands: [BrandSchema]
});

const FastOrderCategorySchema = new mongoose.Schema({
    idCategory: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    image: { type: String, required: true },
    subCategories: [SubCategorySchema]
});

const FastOrderCategory = mongoose.model("FastOrderCategory", FastOrderCategorySchema);
export default FastOrderCategory;
