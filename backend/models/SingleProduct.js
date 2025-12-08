// backend/models/SingleProduct.js
import mongoose from "mongoose";

const PriceHistorySchema = new mongoose.Schema({
    date: { type: Date, required: true },
    minPrice: { type: Number, required: true },
    maxPrice: { type: Number, required: true }
});

const OptionChildSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    label: { type: String, required: true },
    value: { type: String, required: true },
    selected: { type: Boolean, default: false }
});

const OptionSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    label: { type: String, required: true },
    slug: { type: String, required: true },
    type: { type: String, required: true },
    children: [OptionChildSchema]
});


const SupplierSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    name: { type: String, required: true },
    action: {type: Number, required: true},
    deliveryTime: {type: Object, required: true},
    images: {type: [String], required: false, default: [""]},
    psid: {type: String, required: true},
    shortName: {type: String, required: true},
    payment_type: { type: String, required: true },
    delivery: { type: [Object], required: true },
    buy_type: { type: String, required: true },
    price: {
        regularPrice: { type: Number, required: true },
        discountedPrice: { type: Number, required: true },
        discountPercent: { type: Number, default: null },
        foreignCurrencyPrice: { type: Number, default: 0 },
        secondaryCost: { type: Number, default: 0 },
        percentagePrice1: { type: Number, default: 0 }, // ⭐ قیمت درصدی 1 (قیمت عادی)
        percentagePrice2: { type: Number, default: 0 }, // ⭐ قیمت درصدی 2 (قیمت تخفیف خورده)
        percentagePrice3: { type: Number, default: 0 }, // ⭐ قیمت درصدی 3 (قیمت ویژه تولید کننده)
        ICPrice: [
            {
                ICID: { type: String, required: true },
                label: { type: String, required: true },
                name: { type: String, required: true },
                amount: { type: Number, required: true }
            }
        ]
    },
    sku: { type: String, required: true },
    stock: { type: Number, required: true },
    minOrder: { type: Number, required: true },
    maxOrder: { type: Number, required: true },
    rating: { type: String, required: true },
    reviews_count: { type: Number, required: true },
    reviews: { type: Array, default: [] },
    selected: { type: Boolean, default: false },
    special_offer: { type: Date, default: null }
});

const CombinationSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    selected: { type: Boolean, default: false },
    options: [
        {
            id: { type: Number, required: true },
            value: { type: String, required: true },
            attribute_name: { type: String, required: true },
            type: {type: String, required: true},
            attribute_id: { type: Number, required: true }
        }
    ],
    suppliers: [SupplierSchema]
});

const SingleProductSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    general: {
        slug: { type: String, default: null },
        title: { type: String, required: true },
        english_title: { type: String, required: true },
        brandId: {type: String, required: true },
        brandName: {type: String, required: true },
        brandNamePer: {type: String, required: true},
        categoryName: {type: String, required: true},
        categoryNamePer: {type: String, required: true},
        categoryId: {type: String, required: true},
        subCategoryName: {type: String, required: true},
        subCategoryNamePer: {type: String, required: true},
        subCategoryId: {type: String, required: true},
        addedToFavorite: { type: Boolean, default: false },
        images: { type: [String], required: true },
        description: { type: String, required: true },
        specifications: { type: Object, default: null },
        priceHistory: [PriceHistorySchema]
    },
    options: [OptionSchema],
    combinations: [CombinationSchema]
});

const SingleProduct = mongoose.model("SingleProduct", SingleProductSchema);
export default SingleProduct;