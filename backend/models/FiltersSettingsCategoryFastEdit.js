import mongoose from "mongoose";

const { Schema } = mongoose;

const UniqueIDClickedSubCategoriesSchema = new Schema({
  idCategory: { type: String, required: true },
  idSubCategories: [{ type: String, required: true }]
}, { _id: false });

const UniqueIDClickedSubCategoriesBrandsSchema = new Schema({
  idSubCategories: [{ type: String, required: true }],
  idBrands: [
    {
      idSubCategory: { type: String, required: true },
      idBrands: [{ type: String, required: true }]
    }
  ]
}, { _id: false });

const FiltersSchema = new Schema({
  color: { type: String, default: "all" },
  province: { type: String, default: "all" },
  stockStatus: { type: String, default: "all" },
  minStock: { type: String, default: "" },
  deliveryTime: { type: String, default: "" },
  paymentType: { type: String, default: "" },
  supplier: { type: String, default: "" },
  sort: { type: String, default: "bestPrice" },
  priceFormat: { type: String, default: "hezar" }
}, { _id: false });

const SearchSchema = new Schema({
  id: { type: String, required: true }, 
  filterName: { type: String, required: true },
  searchType: { type: String, enum: ["category"], required: true },
  parent: [{ type: String }],
  subCategory: [{ type: String }],
  uniqueIDClickedCategories: [{ type: String }],
  uniqueIDClickedSubCategories: [UniqueIDClickedSubCategoriesSchema],
  uniqueIDClickedSubCategoriesBrands: [UniqueIDClickedSubCategoriesBrandsSchema],
  filters: FiltersSchema
}, { _id: false });

const FiltersSettingsCategoryFastEditSchema = new Schema({
  user_id: { type: Number },
  searches: { type: [SearchSchema], default: [] }
}, { timestamps: true });

export default mongoose.model("FiltersSettingsCategoryFastEdit", FiltersSettingsCategoryFastEditSchema);
