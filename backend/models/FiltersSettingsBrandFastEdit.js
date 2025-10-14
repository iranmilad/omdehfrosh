import mongoose from "mongoose";

const SubCategorySchema = new mongoose.Schema({
  idCategory: { type: String, required: true },
  idSubCategories: [{ type: String, required: true }]
});

const FilterBrandCategorySubCategorySchema = new mongoose.Schema({
  idBrand: { type: String, required: true },
  idCategories: [{ type: String, required: true }],
  idSubCategories: [SubCategorySchema]
});

const UniqueIDClickedBrandCategorySchema = new mongoose.Schema({
  idBrand: { type: String, required: true },
  idCategories: [{ type: String, required: true }]
});

const FiltersSchema = new mongoose.Schema({
  color: { type: String },
  province: { type: String },
  stockStatus: { type: String },
  minStock: { type: String },
  deliveryTime: { type: String },
  paymentType: { type: String },
  supplier: { type: String },
  sort: { type: String },
  priceFormat: { type: String }
});

const SearchSchema = new mongoose.Schema({
  id: { type: String, required: true },
  filterName: { type: String, required: true },
  searchType: { type: String, required: true },
  uniqueIDClickedBrands: [{ type: String }],
  uniqueIDClickedBrandsCategories: [UniqueIDClickedBrandCategorySchema],
  filterBrandsCategorySubCategoryStorage: [FilterBrandCategorySubCategorySchema],
  filters: FiltersSchema
}, { _id: false });

const FiltersSettingsBrandFastEditSchema = new mongoose.Schema({
  user_id: { type: Number, required: true, unique: true },
  searches: { type: [SearchSchema], default: [] }
});

export default mongoose.model("FiltersSettingsBrandFastEdit", FiltersSettingsBrandFastEditSchema);
