import mongoose from "mongoose";

const HomePageSectionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        "wideslider",
        "categories",
        "featured_promo",
        "banners",
        "prices",
        "trendProducts",
        "brands",
        "productloop",
      ],
    },
    title: {
      type: String,
      default: "",
    },
    order: {
      type: Number,
      default: 0,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    checkalllink: String,
    backgroundColor: String,
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true }
);

HomePageSectionSchema.index({ enabled: 1, order: 1 });

export default mongoose.model("HomePageSection", HomePageSectionSchema);
