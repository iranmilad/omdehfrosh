import mongoose from "mongoose";

const wideSliderSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true
    },
    desktopImage: {
      type: String,
      required: true,
      trim: true
    },
    mobileImage: {
      type: String,
      required: true,
      trim: true
    },
    tabletImage: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("WideSlider", wideSliderSchema);
