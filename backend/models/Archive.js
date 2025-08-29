import mongoose from "mongoose";

const ArchiveSchema = new mongoose.Schema({
  totalPages: { type: Number, required: true }, // Total number of pages in the archive
  price: {
    min: { type: Number, required: true }, // Minimum price filter
    max: { type: Number, required: true }, // Maximum price filter
  },
  products: [
    {
      id: { type: Number, required: true }, // Product ID
      title: { type: String, required: true }, // Product title
      slug: { type: String, required: true }, // Product slug
      regularPrice: { type: Number, required: true }, // Regular price
      image: { type: String, required: true }, // Product image URL
    },
  ],
  filters: [
    {
      title: { type: String, required: true }, // Filter title (e.g., "برندها", "رنگ‌ها")
      key: { type: String, required: true }, // Unique filter key (e.g., "brands", "colors")
      options: [
        {
          label: { type: String, required: true }, // Display name of the filter option (e.g., "اپل", "قرمز")
          value: { type: String, required: true }, // Value for filtering (e.g., "apple", "red")
        },
      ],
    },
  ],
});

const Archive = mongoose.model("Archive", ArchiveSchema);

export default Archive;
